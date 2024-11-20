const mongodb = require("../utils/mongodb")
const fs = require("fs")
const path = require("path")
const s3bucket = require("../utils/s3-bucket")
const filesize = require("file-size")
const uuid = require("uuid").v4
const { extension, lookup } = require("mime-types")
const { first, last, } = require("lodash")

const SOURCE = "HH3.attachements"
const PROCESSED = "HH3.attachements_processed"

const DEST = "ADE-FILES/"

const db = require("../../.config-migrate-db").mongodb.ade


const resolveSource = d => {
    if (d.storage == "s3") return "S3"
    if (/^\.\/api\/controller\/file\/gd\?id/.test(d.data.url)) return "GD"
    if (/^https\:\/\/firebasestorage\.googleapis\.com/.test(d.data.url)) return "FB"

}

const resolvers = {

    GD: async d => {
        let id = uuid()
        let source
        let target

        try {

            source = last(d.data.url.split("?id="))
            target = `${DEST}${id}${path.extname(d.data.publicName)}`

        
            const googleDrive = await require("../utils/drive3")()
            const drive = await googleDrive.create()
            let stream = await drive.geFiletWriteStream({ id: source })

            await s3bucket.uploadFromStream({
                stream,
                target,
                callback: progress => {
                    process.stdout.write(`COPY FROM GD > ${filesize(progress.loaded).human("jedec")} > ${target}`)
                }
            })
            console.log()
            return {
                type: "GD",
                id,
                source,
                target,
                path: target
            }
        } catch (e) {

            console.log(e.toString(), e.stack)
            return {
                type: "GD",
                id,
                source,
                target,
                error: `${e.toString()} ${e.stack}`
            }

        }
    },

    FB: async d => {

        let id = uuid()

        let mimeType 
        let source
        let target

        try {

        mimeType = d.data.mimeType || "application/octet-stream"
        mimeType = (mimeType == "application/octet-stream") ? "image/jpeg" : mimeType

        source = `${d.data.url}`
        target = `${ DEST }${ id }.${ extension(mimeType) }`

            await s3bucket.uploadFromURL({
                source,
                target,
                callback: (progress) => {
                    process.stdout.write(`COPY FROM FB > ${filesize(progress.loaded).human("jedec")} > ${target}                 ${'\x1b[0G'}`)
                }
            })

            console.log()

            return {
                type: "FB",
                id,
                source,
                target,
                path: target
            }

        } catch (e) {
            console.log(e.toString(), e.stack)
            return {
                type: "FB",
                id,
                source,
                target,
                error: `${e.toString()} ${e.stack}`
            }
        }
    },

    S3: async d => {

        let id = uuid()
        let source
        let target

        try {

            source = `${d.data.path}`
            target = `${DEST}${id}.${path.extname(d.data.path)}`

            await s3bucket.copy({
                source: s,
                target: t,
                callback: ({ sourceBucketAlias, sourceKey, destinationBucketAlias, destinationKey }) => {
                    console.log(`${sourceBucketAlias}:${sourceKey} > ${destinationBucketAlias}:${destinationKey}`)
                }
            })

            console.log()

            return {
                type: "S3",
                id,
                source,
                target,
                path: target
            }

        } catch (e) {
            console.log(e.toString(), e.stack)
            return {
                type: "S3",
                id,
                source,
                target,
                error: `${e.toString()} ${e.stack}`
            }
        }
    }

}



const resolveURL = async buffer => {

    buffer = buffer.filter(d => d && d.data)
    let result = []

    for (let d of buffer) {

        let resolver = resolvers[resolveSource(d)]
        if (resolver) {
  
            let res = await resolver(d)
  
            if (!res.error) {

                d.data.id = res.id
                d.data.path = res.path
                d.data.name = last(res.path.split("/"))
                d.data.publicName = d.data.name
                d.data.mimeType = lookup(d.data.publicName)
                d.data.storage = "s3"
                d.data.url = await s3bucket.getPresignedUrl(res.path)

            } else {
                d.error = res
            }

        } else {
            d.error = "No resolver"
        }

        d.migratedAt = new Date()
        result.push(d)

    }

    return result
}


const run = async () => {

    const PAGE_SIZE = 50
    let skip = 0
    let bufferCount = 0

    do {

        const pipeline = [{
                '$match': {
                    process_atch: {
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
            console.log(`${SOURCE} > Read buffer ${bufferCount} started at ${skip}: ${buffer.length} items`)

            
            if (buffer.length > 0) {
              
                let processedBuffer = await resolveURL(buffer)
                
                let commands = processedBuffer.map( d => ({
                  replaceOne:{
                    filter: {"data.id": "d.data.id"},
                    replacement: d,
                    upsert: true
                  }
                }))

                await mongodb.bulkWrite({
                    db,
                    collection: PROCESSED,
                    commands
                })

            }

            await mongodb.updateMany({
                db,
                collection: SOURCE,
                filter: { "data.id": { $in: buffer.map(d => d.data.id) } },
                data: {
                    process_atch: true
                }
            })

        }

        skip += buffer.length
        bufferCount++

    } while (buffer.length > 0)

}


run()