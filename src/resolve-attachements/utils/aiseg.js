const mongodb = require("../../utils/mongodb")
const { find } = require("lodash")

const db = require("../../../.config-migrate-db").mongodb.ade

const resolveSegmentation = async (SCHEMA, buffer) => {

    let pipeline = [{
            $match: {
                id: {
                    $in: buffer.map(d => d.aiSegmentation).filter(d => d)
                }
            }
        },
        {
            $project: {
                _id: 0,
                id: 1,
                data: 1
            }
        }
    ]

    let segmentations = await mongodb.aggregate({
        db,
        collection: `${SCHEMA}.segmentations`,
        pipeline
    })

    console.log(`${SCHEMA}.segmentations > Read ${segmentations.length} items`)


    buffer = buffer.map(d => {
        d.aiSegmentation = find(segmentations, s => s.id == d.aiSegmentation)
        d.aiSegmentation = (d.aiSegmentation) ? d.aiSegmentation.data : undefined
        return d
    })

    return buffer
}


const execute = async SCHEMA => {
    
    if (!SCHEMA) {
        console.log("--schema required")
        return
    }

    console.log("ATTACH AI SEGMENTATION for ", SCHEMA)

    const PAGE_SIZE = 500
    let skip = 0
    let bufferCount = 0

    do {

        const pipeline = [{
                '$match': {
                    process_ai: {
                        $exists: false
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
            collection: `${SCHEMA}.labels`,
            pipeline
        })

        if (buffer.length > 0) {

            console.log(`${SCHEMA}.labels > Read buffer ${bufferCount} started at ${skip}: ${buffer.length} items`)

            buffer = await resolveSegmentation(SCHEMA, buffer)

            if (buffer.length > 0) {

                let commands = buffer.map(d => ({
                    replaceOne: {
                        filter: { "id": d.id },
                        replacement: d,
                        upsert: true
                    }
                }))

                await mongodb.bulkWrite({
                    db,
                    collection: `${SCHEMA}.labels-ai`,
                    commands
                })

                console.log(`Write processed labels: ${buffer.length} items into ${SCHEMA}.labels-ai`)

            }

            await mongodb.updateMany({
                db,
                collection: `${SCHEMA}.labels`,
                filter: { "id": { $in: buffer.map(d => d.id) } },
                data: {
                    process_ai: true
                }
            })

        }

        skip += buffer.length
        bufferCount++

    } while (buffer.length > 0)

}


module.exports = execute