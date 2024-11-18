const yargs = require("yargs");
const mongodb = require("../utils/mongodb")
const db = require("../../.config-migrate-db").mongodb.ade

const settings = yargs.argv;

const SOURCE = settings.s || settings.source
const DEST = settings.d || settings.dest

console.log(`MIGRATE DATA "${SOURCE}" > "${DEST}"`)





const run = async () => {

    if (!SOURCE || !DEST) {
        console.log("NO DATA")
        return
    }

    const PAGE_SIZE = 500

    let buffer = []
    let bufferCount = 0
    let skip = 0


    do {

        const pipeline = [{
                '$match': {
                    migrated: {
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
            collection: SOURCE,
            pipeline
        })
        if (buffer.length > 0) {
            console.log(`${SOURCE} > Read buffer ${bufferCount}: starts at ${skip} ${buffer.length} items`)
            // console.log(buffer.map(b => b.id).join("\n"))

            if (buffer.length > 0) {
                await mongodb.insertAll({
                    db,
                    collection: DEST,
                    data: buffer
                })

            }

            // let ops = buffer.map(b => ({
            //     replaceOne: {
            //         "filter": { id: b.id },
            //         "replacement": b,
            //         "upsert": true
            //     }
            // }))

            // if (ops.length > 0) {
            //     await mongodb.bulkWrite({
            //         db,
            //         collection: DEST,
            //         commands: ops
            //     })
            // }

            console.log(`${DEST} > Write ${buffer.length} items`)

            await mongodb.updateMany({
                db,
                collection: SOURCE,
                filter: {id: { $in: buffer.map(d => d.id)}},
                data: {
                  migrated: true
                }
            })


            // ops = buffer.map(b => ({
            //     updateOne: {
            //         "filter": { id: b.id },
            //         "update": {
            //             $set: { migrated: true }
            //         }
            //     }
            // }))

            // if (ops.length > 0) {
            //     await mongodb.bulkWrite({
            //       db,
            //       collection:SOURCE, 
            //       commands: ops
            //     })
            // }

        }

        skip += buffer.length
        bufferCount++

    } while (buffer.length > 0)

}

run()