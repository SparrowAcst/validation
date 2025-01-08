const mongodb = require("../../utils/mongodb")
const fs = require("fs")
const uuid = require("uuid").v4
const {extend} = require("lodash")


const CONFIG = require("../../../.config-migrate-db")
const db = CONFIG.mongodb.ade

const parse = require("./user-agent-parser")

const execute = async () => {

    const COLLECTION = "sparrow.innocent-reallife-labels"

    console.log(`FIX USER AGENT FOR ${COLLECTION}`)

    const PAGE_SIZE = 500
    let skip = 0
    let bufferCount = 0

    do {

        const pipeline = [

            {
                '$match': {
                    "deviceDescription.appStoreRegion":{
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
                    deviceDescription: 1
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
                                deviceDescription: extend({}, d.deviceDescription, parse(d.deviceDescription.userAgent))                             
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