const docdb = require("../../utils/docdb")("TEST")
const mongodb = require("../../utils/mongodb")
const db = require("../../../.config-migrate-db").mongodb.ade
const { find, groupBy, keys, first, last, isUndefined, flatten } = require("lodash")
const Diff = require("./diff")
const uuid = require("uuid").v4
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
    
    return flatten(result)
}

const resolveBuffer = async (buffer, SCHEMA) => {

    let [targetLabels, sourceLabels] = await Promise.all([
        getTargetLabels(buffer, SCHEMA),
        getSourceLabels(buffer)
    ])
    
    buffer = buffer.map(b => {
        b.sourceData = find(sourceLabels, d => b.source.id == d.id)
        b.targetData = find(targetLabels, d => b.target.id == d.id)
        return b
    })

    let updates = await detectChanges(buffer)

    console.log(`Targets: ${buffer.length}, Updates: ${updates.length}`)

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
        
        ( async () => {

            if (commands.length > 0) {

                console.log(`Update ${commands.length} items in ${SCHEMA}.labels`)

                await docdb.bulkWrite({
                    collection: `${SCHEMA}.labels`,
                    commands
                })
                
                console.log(`Update ${commands.length} items in ${SCHEMA}.labels - DONE`)
                
            }

        })(),
        
        (async () => {
            
            if( commands.length > 0){
                console.log(`Save info for update ${UPDATE_ID} for ${updCommands.length} items in ${UPDATES}`)
                await mongodb.insertAll({
                    db,
                    collection: UPDATES,
                    data: [{
                        id: UPDATE_ID,
                        date: new Date(),
                        collection: `${SCHEMA}.labels`,
                        commands: JSON.stringify(commands),
                        delta: updates
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

    const PAGE_SIZE = 1000 //1
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

            await resolveBuffer(buffer, SCHEMA)

        }

        skip += buffer.length
        bufferCount++

    } while (buffer.length > 0 )

    console.log(`SYNC LABELS FOR ${SCHEMA} ${UPDATE_ID} - DONE`)

}

module.exports = execute