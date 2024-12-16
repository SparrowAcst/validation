const docdb = require("../../utils/docdb")
const mongodb = require("../../utils/mongodb")
const db = require("../../../.config-migrate-db").mongodb.ade
const { find, groupBy, keys, first, last } = require("lodash")
const Diff = require("./diff")
const uuid = require("uuid").v4


const UPDATE_ID = uuid()

const CROSS = "ADE-TRANSFORM.cross-examinations"

const findExaminationUpdate = (id, pool) => {
    return find(pool, d => d.patientId == id)
}


const detectChanges = delta => {
    return keys(delta).map(key => delta[key].length > 0).reduce((a, b) => a || b, false)
}

const getSourceExaminations = async buffer => {

    let queries = groupBy(buffer, d => d.source.collection)

    queries = keys(queries).map(key => ({
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
                    "forms.attachements": {
                        $first: {
                            $filter: {
                                input: "$f",
                                as: "item",
                                cond: {
                                    $eq: [
                                        "$$item.type",
                                        "attachements",
                                    ],
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
        ]
    }))


    let updates = []

    if (queries.length > 0) {

        for (const query of queries) {

            let part = await mongodb.aggregate({
                db,
                collection: query.collection,
                pipeline: query.pipeline
            })

            console.log(`Load from ${query.collection} ${part.length} items`)
            updates = updates.concat(part)

        }

    }

    buffer = buffer.map(d => {
        d.$update = findExaminationUpdate(d.source.patientId, updates)
        return d
    })



    return buffer

}

const resolveBuffer = async (buffer, COLLECTION) => {

    let cross = await mongodb.aggregate({
        db,
        collection: CROSS,
        pipeline: [{
            $match: {
                crashed: {
                    $exists: false
                },
                "target.id": {
                    $in: buffer.map(d => d.id)
                }
            }
        }]
    })

    let requireUpdates = buffer.map(d => {

        let src = find(cross, c => c.target.id == d.id)

        if (!src) {
            // console.log(`${d.id}: IGNORE`)
            return
        } else {
            // console.log(`${COLLECTION}.${d.id}: ${src.source.patientId} from ${src.source.collection}`)
            return src
        }

    })

    requireUpdates = requireUpdates.filter(d => d)

    console.log(`Required to update: ${requireUpdates.length} items`)

    let updates = await getSourceExaminations(requireUpdates)

    updates = updates.filter(u => {
        let f = find(buffer, d => d.id == u.target.id)
        return detectChanges(
            Diff.format(
                Diff.delta(
                    f,
                    u.$update,
                    "workflowTags",
                    "forms.echo",
                    "forms.ekg",
                    "forms.patient"
                )
            )
        )
    })

    console.log(`Detect changes: ${updates.length} items`)

    updates.forEach(u => {
        let f = find(buffer, d => d.id == u.target.id)
        console.log(`${u.target.id} - ${u.source.patientId}`)
        // console.log(    Diff.format( 
        //         Diff.delta(
        //             f,
        //             u.$update,
        //             "workflowTags",
        //             "forms.echo",
        //             "forms.ekg",
        //             "forms.patient"
        //         )
        //     ))
    })

    let commands = buffer.map(b => ({
        updateOne: {
            filter: { id: b.id },
            update: {
                $set: {
                    update: UPDATE_ID
                }
            },
            upsert: true
        }

    }))

    if (commands.length > 0) {

        console.log(`Update ${commands.length} items`)

        await docdb.bulkWrite({
            collection: COLLECTION,
            commands
        })
    }
}

const execute = async COLLECTION => {



    console.log(`SYNC EXAMINATIONS FOR ${COLLECTION} ${UPDATE_ID}`)

    const PAGE_SIZE = 100
    let skip = 0
    let bufferCount = 0

    do {

        const pipeline = [{
                '$match': {
                    
                    update: {
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

        buffer = await docdb.aggregate({
            collection: COLLECTION,
            pipeline
        })

        if (buffer.length > 0) {

            console.log(`DocDB: ${COLLECTION} > Read buffer ${bufferCount} started at ${skip}: ${buffer.length} items`)
            // console.log(buffer)
            let commands = []

            // if (buffer.length > 0) {

            await resolveBuffer(buffer, COLLECTION)

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

            //         if(commands.length > 0){

            //             console.log(`${COLLECTION} > Update ${commands.length} items`)

            //             await mongodb.bulkWrite({
            //                 db,
            //                 collection: COLLECTION,
            //                 commands
            //             })
            //         }    


            // }

        }

        skip += buffer.length
        bufferCount++

    } while (buffer.length > 0 && bufferCount < 2)
    
    console.log(`SYNC EXAMINATIONS FOR ${COLLECTION} ${UPDATE_ID} DONE`)

}



module.exports = execute