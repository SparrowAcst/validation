const mongodb = require("../../utils/mongodb")
const fs = require("fs")

const CONFIG = require("../../../.config-migrate-db")

const db = CONFIG.mongodb.ade

const execute = async () => {

    const COLLECTION = "sparrow.H3-FORM"

    console.log(`FIX HEIC FOR ${COLLECTION}`)

    const PAGE_SIZE = 100
    let skip = 0
    let bufferCount = 0

    do {

        const pipeline = [

            {
                '$match': {
                    type: "attachements",
                    data: {
                        $elemMatch: {
                            name: {
                                $regex: "heic|HEIC"
                            }
                        }
                    },

                    process_heic: {
                        $exists: false
                    }
                }
            },
            {
                '$limit': PAGE_SIZE
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    resolvedData: 1
                }
            }
        ]

        buffer = await mongodb.aggregate({
            db,
            collection: COLLECTION,
            pipeline
        })

        if (buffer.length > 0) {

            console.log(`${COLLECTION} > Read buffer ${bufferCount} started at ${skip}: ${buffer.length} items`)

            let commands = []

            if (buffer.length > 0) {

                buffer = buffer.map(d => {
                    d.resolvedData = d.resolvedData.map( d => {
                        if (/HEIC/.test(d.name)) {
                            d.name = d.name.replace("HEIC", "jpg")
                            d.path = d.path.replace("HEIC", "jpg")
                            d.publicName = d.publicName.replace("HEIC", "jpg")
                            d.mimeType = d.mimeType.replace("heic", "jpeg")
                        }
                        if (/heic/.test(d.name)) {
                            d.name = d.name.replace("heic", "jpg")
                            d.path = d.path.replace("heic", "jpg")
                            d.publicName = d.publicName.replace("heic", "jpg")
                            d.mimeType = d.mimeType.replace("heic", "jpeg")
                        }
                        return d
                    })
                    d.process_heic = true
                    return d
                })    

                // console.log(buffer[0])

                let commands = buffer.map(d => ({
                    updateOne: {
                        filter: { id: d.id },
                        update: {
                            $set: {
                                resolvedData: d.resolvedData,
                                process_heic: true
                            }
                        },
                        upsert: true
                    }
                }))

                // console.log(JSON.stringify(commands[0], null, " "))

                if (commands.length > 0) {

                    console.log(`${COLLECTION} > Update ${commands.length} items`)

                    await mongodb.bulkWrite({
                        db,
                        collection: COLLECTION,
                        commands
                    })
                }

            }

        }

        skip += buffer.length
        bufferCount++

    } while (buffer.length > 0)

}

module.exports = execute