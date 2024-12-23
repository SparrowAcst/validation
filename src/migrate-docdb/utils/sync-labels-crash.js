const docdb = require("../../utils/docdb")
const mongodb = require("../../utils/mongodb")
const db = require("../../../.config-migrate-db").mongodb.ade
const { find, groupBy, keys, first, last, isUndefined, flatten } = require("lodash")
const Diff = require("./diff")
const uuid = require("uuid").v4
const sanitizePipeline = require("./sanitize-pipelines")

const UPDATE_ID = uuid()

const CROSS = "ADE-TRANSFORM.cross-crash-labels"
const SOURCE = "ADE-TRANSFORM.labels"
const TARGET = "ADE-TRANSFORM.labels-crash-update"


const SEGMENTATION_MAP = {
    "sparrow.yoda": "sparrow.yoda-SEGMENTATION",
    "sparrow.H2": "sparrow.H2-SEGMENTATION"
}


const getSourceLabels = async (buffer, source) => {

    let queries = groupBy(buffer, d => d.source.collection)

    queries = keys(queries).map(key => {

        // let segmentationCollection = (queries[key].length > 0) ? queries[key][0].source.segmentationCollection : ""
        let segmentationCollection = SEGMENTATION_MAP[key] 
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
    
    return flatten(result)
}

const resolveBuffer = async buffer => {

    let sourceLabels = await getSourceLabels(buffer)
    
    buffer = buffer.map(b => {
        b.sourceData = find(sourceLabels, d => b.source.id == d.id)
        if(b.sourceData){
            b.sourceData["Examination ID"] = b.target["Examination ID"]   
        }
         
        return b
    })


    console.log(`Targets: ${buffer.length}, Updates: ${buffer.length}`)

    let updCommands = buffer.map( b => ({
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
        
        ( async () => {

            console.log(`Save data for update ${UPDATE_ID} for ${buffer.length} items in ${TARGET} ...`)
               
            await mongodb.insertAll({
                db,
                collection: TARGET,
                data: buffer.map( d => d.sourceData)
            })

            console.log(`Save data for update ${UPDATE_ID} for ${buffer.length} items in ${TARGET} - DONE`)
  
        })(),
        
        ( async () => {
            
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

const execute = async () => {

    console.log(`SYNC CRASH LABELS ${UPDATE_ID}`)

    console.log(`DROP ${TARGET} ...`)
      
    await mongodb.drop({
        db,
        collection: TARGET
    })

    console.log(`DROP ${TARGET} - DONE`)
  

    const PAGE_SIZE = 1000
    let skip = 0
    let bufferCount = 0

    do {

        const pipeline = [{
                '$match': {
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

        console.log(`ADE-TRANSFORM: > Read buffer ${bufferCount} started at ${skip} ...`)

        buffer = await mongodb.aggregate({
            db,
            collection: CROSS,
            pipeline
        })


        if (buffer.length > 0) {

            console.log(`ADE-TRANSFORM: > Read buffer ${bufferCount} started at ${skip}: ${buffer.length} items`)
            let commands = []

            await resolveBuffer(buffer)

        }

        skip += buffer.length
        bufferCount++

    } while (buffer.length > 0 ) // && bufferCount < 1)

    console.log(`SYNC CRASH LABELS FOR ${UPDATE_ID} - DONE`)

}

module.exports = execute