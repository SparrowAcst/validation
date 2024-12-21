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
const UPDATES = "ADE-TRANSFORM.update-log-labels"

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
    console.log(`Load from ${SCHEMA}.labels ...`)
    let result = await docdb.aggregate({ collection, pipeline })
    console.log(`Load from ${SCHEMA}.labels ${result.length} items`)
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


    let result = await Promise.all(queries.map( query => 
        ( async () => {
            console.log(`Load from ${query.collection} ...`)
            let part = await mongodb.aggregate({
                db,
                collection: query.collection,
                pipeline: query.pipeline
            })
            console.log(`Load from ${query.collection} ${part.length} items`)
            return part
        })()
    ))

    // if (queries.length > 0) {

    //     for (const query of queries) {

    //         console.log(`Load from ${query.collection} ...`)
    //         let part = await mongodb.aggregate({
    //             db,
    //             collection: query.collection,
    //             pipeline: query.pipeline
    //         })

    //         console.log(`Load from ${query.collection} ${part.length} items`)
    //         result = result.concat(part)

    //     }

    // }
    console.log(result.length)
    console.log(result)
    result = flatten(result)
    console.log(result.length)
    
    return  result

}

const resolveBuffer = async (buffer, SCHEMA) => {

    let [targetLabels, sourceLabels] = await Promise.all([
        getTargetLabels(buffer, SCHEMA),
        getSourceLabels(buffer)
    ])
    
    // let targetLabels = await getTargetLabels(buffer, SCHEMA)
    // let sourceLabels = await getSourceLabels(buffer)

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


    updCommands = buffer.map( b => ({
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

    await Promise.all([
        
        (async () => {
            
            if( commands.length > 0){
                console.log(`Save update info for update ${UPDATE_ID} for ${updCommands.length} items in ${UPDATES}`)
                await mongodb.insertAll({
                    db,
                    collection: UPDATES,
                    data: [{
                        id: UPDATE_ID,
                        date: new Date(),
                        collection: `${SCHEMA}.labels`,
                        commands: JSON.stringify(commands)
                    }]
                })
                console.log(`Save update info for update ${UPDATE_ID} - DONE`)
            }    

        })(),
        
        (async () => {
            
            if( updCommands.length > 0){
                console.log(`Set update status ${UPDATE_ID} for ${updCommands.length} items in ${CROSS}`)
                await mongodb.bulkWrite({
                    db,
                    collection: CROSS,
                    commands: updCommands
                })
                console.log(`Set update status ${UPDATE_ID} - DONE`)
            }

        })()
    ])

}

const execute = async SCHEMA => {

    console.log(`SYNC LABELS FOR ${SCHEMA} ${UPDATE_ID}`)

    const PAGE_SIZE = 500 //1
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

        console.log(`ADE-TRANSFORM: ${SCHEMA} > Read buffer ${bufferCount} started at ${skip} ...`)

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

    } while (buffer.length > 0 ) // && bufferCount<1)

    console.log(`SYNC LABELS FOR ${SCHEMA} ${UPDATE_ID} - DONE`)

}



module.exports = execute