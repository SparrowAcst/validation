const docdb = require("../../utils/docdb")
const mongodb = require("../../utils/mongodb")
const db = require("../../../.config-migrate-db").mongodb.ade
const { find, groupBy, keys, first, last, isUndefined } = require("lodash")
const Diff = require("./diff")
const uuid = require("uuid").v4

const { flatten, cloneByPattern } = require("./flat")
const sanitizePipeline = require("./sanitize-pipelines")

const UPDATE_ID = uuid()

const CROSS = "ADE-TRANSFORM.cross-examinations"

const detectChanges = delta => {
    return keys(delta).map(key => !isUndefined(delta[key])).reduce((a, b) => a || b, false)
}

const getTargetExaminations = async (buffer, SCHEMA) => {

    let pipeline = [{
            $match: {
                id: {
                    $in: buffer.map(d => d.target.id)
                }
            }
        }
    ]

    let collection = `${SCHEMA}.examinations`

    let result = await docdb.aggregate({ collection, pipeline })
    console.log("targets:", result)
    return result

}


const getSourceExaminations = async buffer => {

    let queries = groupBy(buffer, d => d.source.collection)

    queries = keys(queries).map(key => {

        return {
            collection: key,
            pipeline: [{
                    $match: {
                        "patientId": {
                            $in: queries[key].map(d => d.source.patientId)
                        }
                    }
                },
                {
                    $lookup: {
                        from: last(first(queries[key]).source.form_collection.split(".")),
                        localField: "patientId",
                        foreignField: "patientId",
                        as: "f",
                        pipeline: [{
                            $project: {
                                _id: 0,
                                type: 1,
                                data: 1,
                            },
                        }, ],
                    },
                },
                {
                    $project: {
                        forms: 0,
                    },
                },
                {
                    $set: {
                        "forms.patient": {
                            $first: {
                                $filter: {
                                    input: "$f",
                                    as: "item",
                                    cond: {
                                        $eq: ["$$item.type", "patient"],
                                    },
                                },
                            },
                        },
                        "forms.echo": {
                            $first: {
                                $filter: {
                                    input: "$f",
                                    as: "item",
                                    cond: {
                                        $eq: ["$$item.type", "echo"],
                                    },
                                },
                            },
                        },
                        "forms.ekg": {
                            $first: {
                                $filter: {
                                    input: "$f",
                                    as: "item",
                                    cond: {
                                        $eq: ["$$item.type", "ekg"],
                                    },
                                },
                            },
                        },
                    },
                },
                {
                    $set:

                    {
                        "forms.patient.data": "$forms.patient.data.en",
                        "forms.echo.data": "$forms.echo.data.en",
                        "forms.ekg.data": "$forms.ekg.data.en",
                    },
                },
                {
                    $project: {
                        _id: 0,
                        f: 0,
                    },
                },
            ].concat(sanitizePipeline.examinations)
        }
    })


    let result = []

    if (queries.length > 0) {

        for (const query of queries) {

            let part = await mongodb.aggregate({
                db,
                collection: query.collection,
                pipeline: query.pipeline
            })

            console.log(`Load from ${query.collection} ${part.length} items`)
            result = result.concat(part)

        }

    }

    console.log("sources:",result)
    return result

}

const resolveBuffer = async (buffer, SCHEMA) => {

    let targetExaminations = await getTargetExaminations(buffer, SCHEMA)
    let sourceExaminations = await getSourceExaminations(buffer)

    buffer = buffer.map( b => {
        b.sourceData = find(sourceExaminations, d => b.source.patientId == d.patientId)
        b.targetData = find(targetExaminations, d => b.target.id == d.id)
    })

    console.log(buffer)


    // let updates = targetExaminations.filter(t => {
    //     console.log(Diff.delta(
    //         t,
    //         t.$update,
    //         "forms.echo",
    //         "forms.ekg",
    //         "forms.patient"
    //     ))
    //     return detectChanges(
    //     Diff.delta(
    //         t,
    //         t.$update,
    //         "forms.echo",
    //         "forms.ekg",
    //         "forms.patient"
    //     )
    //     )}
    // )

    // console.log("updates:", JSON.stringify(updates, null, " "))


    // console.log(`Targets: ${targetExaminations.length}, Updates: ${updates.length}`)

    // if( updates.length > 0 ){
    //     updates.forEach( u => {
            
    //         console.log("\n------------------------------------",u)
    //         console.log(Diff.delta(
    //         u,
    //         u.$update,
    //         "forms.echo",
    //         "forms.ekg",
    //         "forms.patient"
    //     ))
    //     })
    // }


    // let commands = buffer.map(b => ({
    //     updateOne: {
    //         filter: { id: b.id },
    //         update: {
    //             $set: {
    //                 update: UPDATE_ID
    //             }
    //         },
    //         upsert: true
    //     }

    // }))

    // if (commands.length > 0) {

    //     console.log(`Update ${commands.length} items`)

    //     // await docdb.bulkWrite({
    //     //     collection: COLLECTION,
    //     //     commands
    //     // })
    // }
}

const execute = async SCHEMA => {



    console.log(`SYNC EXAMINATIONS FOR ${SCHEMA} ${UPDATE_ID}`)

    const PAGE_SIZE = 1
    let skip = 0
    let bufferCount = 0

    do {

        const pipeline = [{
                '$match': {
                    "target.schema": SCHEMA,
                    crashed: {
                        $exists: false
                    },
                    "target.update": {
                        $ne: UPDATE_ID
                    }
                }
            },
            {
                '$limit': PAGE_SIZE
            },
            {
                $project: {
                    _id: 0
                }
            }
        ]

        buffer = await mongodb.aggregate({
            db,
            collection: CROSS,
            pipeline
        })

        console.log(buffer)
            
        if (buffer.length > 0) {

            console.log(`ADE-TRANSFORM: ${SCHEMA} > Read buffer ${bufferCount} started at ${skip}: ${buffer.length} items`)
            let commands = []

            // if (buffer.length > 0) {

            await resolveBuffer(buffer, SCHEMA)

            //         let i = 0

            //         for( let d of buffer){
            //             i++
            //             console.log(`${i} from ${buffer.length}`)

            //             if(d){

            //                 const process_records = await migrateFB2S3({
            //                     id: d.id,
            //                     fbUrl: d.Source.url
            //                 })

            //                 commands.push({
            //                     updateOne: {
            //                         filter: { id: d.id },
            //                         update: {
            //                             $set:{
            //                               process_records  
            //                             }
            //                         },
            //                         upsert: true
            //                     }
            //                 })          
            //             }    
            //         }    

            // if (commands.length > 0) {

            //     console.log(`${CROSS} > Update ${commands.length} items`)

            //     await mongodb.bulkWrite({
            //         db,
            //         collection: CROSS,
            //         commands
            //     })
            // }


            // }

        }

        skip += buffer.length
        bufferCount++

    } while (buffer.length > 0 && bufferCount < 1)

    console.log(`SYNC EXAMINATIONS FOR ${SCHEMA} ${UPDATE_ID} DONE`)

}



module.exports = execute