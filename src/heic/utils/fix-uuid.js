const mongodb = require("../../utils/mongodb")
const fs = require("fs")
const uuid = require("uuid").v4
const CONFIG = require("../../../.config-migrate-db")

const db = CONFIG.mongodb.ade


const sites = require("./sites.json")

const decodeSite = alias => {
    let r = sites.filter(d => d.alias == alias)
    return (r[0]) ? r[0].id : null
}

const execute = async () => {

    const COLLECTION = "sparrow.H3-EXAMINATION"

    console.log(`FIX UUID FOR ${COLLECTION}`)

    const PAGE_SIZE = 100
    let skip = 0
    let bufferCount = 0

    do {

        const pipeline = [

            {
                '$match': {
                    siteId: {
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
                    org: 1
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

                let commands = buffer.map(d => ({
                    updateOne: {
                        filter: { id: d.id },
                        update: {
                            $set: {
                                uuid: uuid(),
                                siteId: decodeSite(d.org)
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