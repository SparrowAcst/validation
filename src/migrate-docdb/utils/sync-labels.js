const docdb = require("../../utils/docdb")
const mongodb = require("../../utils/mongodb")
const db = require("../../../.config-migrate-db").mongodb.ade
const { find, groupBy, keys, first, last, isUndefined } = require("lodash")
const Diff = require("./diff")
const uuid = require("uuid").v4
const { flatten, cloneByPattern } = require("./flat")
const sanitizePipeline = require("./sanitize-pipelines")

const UPDATE_ID = uuid()

const CROSS = "ADE-TRANSFORM.external-labels"

const detectChanges = async buffer => {
    
    let result = []
    
    for( const b of buffer){
        b.delta = await Diff.delta(b.targetData, b.sourceData)
        
        if( b.delta ) result.push(b)
    }
    
    return result
}


const getTargetLabels = async (buffer, SCHEMA) => {

    let pipeline = [{
            $match: {
                id: {
                    $in: buffer.map(d => d.target.id)
                }
            }
        },
        {
            $project: {
                _id: 0,
                examinationId: 0
            }
        }
    ]

    let collection = `${SCHEMA}.labels`

    let result = await docdb.aggregate({ collection, pipeline })
    return result

}


const getSourceLabels = async (buffer, source) => {

    let queries = groupBy(buffer, d => d.source.collection)

    queries = keys(queries).map(key => {

        let segmentationCollection = (queries[key].length > 0) ? queries[key][0].source.segmentationCollection : ""
        segmentationCollection = (segmentationCollection) ? last(segmentationCollection.split(".")) : ""

        return {
            collection: key,
            pipeline: [{
                    $match: {
                        "id": {
                            $in: queries[key].map(d => d.source.id)
                        }
                    }
                }, ]
                .concat((segmentationCollection) ? [{
                        $lookup: {
                            from: segmentationCollection,
                            localField: "aiSegmentation",
                            foreignField: "id",
                            as: "result",
                        },
                    },
                    {
                        $set: {
                            aiSegmentation: {
                                $first: "$result.data",
                            },
                        },
                    },
                    {
                        $unset: "result",
                    }
                ] : [])
                .concat(sanitizePipeline(source).labels)
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

    return result

}

const resolveBuffer = async (buffer, SCHEMA) => {

    let targetLabels = await getTargetLabels(buffer, SCHEMA)
    let sourceLabels = await getSourceLabels(buffer)

    buffer = buffer.map(b => {
        b.sourceData = find(sourceLabels, d => b.source.id == d.id)
        b.targetData = find(targetLabels, d => b.target.id == d.id)
        return b
    })



    let updates = await detectChanges(buffer)

    console.log(`Targets: ${buffer.length}, Updates: ${updates.length}`)

    // if( updates.length > 0 ){
    // updates.forEach( u => {

    //     console.log("\n------------------------------------",u.target.id, u.source.id)
    //     console.log(Diff.delta(
    //     u.targetData,
    //     u.sourceData
    // ))
    // })
    // }


    let commands = updates.map(b => ({
        updateOne: {
            filter: { id: b.target.id },
            update: {
                $set: b.sourceData
            },
            upsert: true
        }

    }))

    console.log(commands)

    // if (commands.length > 0) {

    //     console.log(`Update ${commands.length} items`)

    //     // await docdb.bulkWrite({
    //     //     collection: COLLECTION,
    //     //     commands
    //     // })
    // }


    commands = buffer.map( b => ({
        updateOne: {
            filter: { id: b.id },
            update: {
                $set: {
                    "target.update": UPDATE_ID
                }
            },

            upsert: true
        }
    }))

    if( commands.length > 0){
        await mongodb.bulkWrite({
            db,
            collection: CROSS,
            commands
        })
    }

}

const execute = async SCHEMA => {

    console.log(`SYNC LABELS FOR ${SCHEMA} ${UPDATE_ID}`)

    const PAGE_SIZE = 1000
    let skip = 0
    let bufferCount = 0

    do {

        const pipeline = [{
                '$match': {
                    "target.schema": SCHEMA,
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


        if (buffer.length > 0) {

            console.log(`ADE-TRANSFORM: ${SCHEMA} > Read buffer ${bufferCount} started at ${skip}: ${buffer.length} items`)
            let commands = []

            // console.log(buffer)
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

    } while (buffer.length > 0)

    console.log(`SYNC LABELS FOR ${SCHEMA} ${UPDATE_ID} DONE`)

}



module.exports = execute