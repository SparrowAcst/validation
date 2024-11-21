const mongodb = require("../../utils/mongodb")
const fs = require("fs")
const path = require("path")
const s3bucket = require("../../utils/s3-bucket")
const filesize = require("file-size")
const uuid = require("uuid").v4
const { extension, lookup } = require("mime-types")
const { first, last, } = require("lodash")


const db = require("../../../.config-migrate-db").mongodb.ade

 const DEST = "ADE-FILES/"


const resolveSource = d => {
    if (d.data.storage == "s3") return "S3"
    if (/^\.\/api\/controller\/file\/gd\?id/.test(d.data.url)) return "GD"
    if (/^https\:\/\/firebasestorage\.googleapis\.com/.test(d.data.url)) return "FB"

}

const resolvers = {

    GD: async d => {

        if (!d.data ) {
            return {
                error: "no data"
            }
        }

        let id = d.data.id //uuid()

        let source
        let target

        try {

            source = last(d.data.url.split("?id="))
            target = `${DEST}${id}${path.extname(d.data.publicName)}`


            const googleDrive = await require("../../utils/drive3")()
            const drive = await googleDrive.create()
            let stream = await drive.geFiletWriteStream({ id: source })

            await s3bucket.uploadFromStream({
                stream,
                target,
                callback: progress => {
                    process.stdout.write(`COPY FROM GD > ${filesize(progress.loaded).human("jedec")} > ${target}         ${'\x1b[0G'}`)
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

        if (!d.data) {
            return {
                error: "no data"
            }
        }

        let id = d.data.id //uuid()

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
                    process.stdout.write(`COPY FROM FB > ${filesize(progress.loaded).human("jedec")} > ${target}     ${'\x1b[0G'}`)
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

        if (!d.data) {
            return {
                error: "no data"
            }
        }

        let id = d.data.id //uuid()
        let source
        let target

        try {

            source = `${d.data.path}`
            target = `${DEST}${id}${path.extname(d.data.path)}`


            let meta = await s3bucket.metadata(source)
            if(!meta){
              return {
                  type: "S3",
                  id,
                  source,
                  target,
                  error: `Source "${source}" not exists`
              }
            }
            
            await s3bucket.copy({
                source,
                target,
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

    buffer = buffer //.filter(d => d && d.data)
    let result = []

    for (let d of buffer) {

        if (d) {

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
        } else {
            d.error = "data is undefined or null"
        }

        d.migratedAt = new Date()
        result.push(d)

    }

    return result
}


const execute = async SCHEMA => {

    const SOURCE = `${SCHEMA}.attachements`
    const PROCESSED = `${SCHEMA}.attachements_processed`
    const ENCODING = `ADE_ENCODING.${SCHEMA}_files`

   

    console.log(`MIGRATE FILES FOR ${SCHEMA}`)
    console.log(SOURCE, PROCESSED, ENCODING)

    const PAGE_SIZE = 1
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

                let clinicalFileNames = buffer.map( b => (b && b.data) ? b.data.name || b.data.publicName : undefined)
                let processedBuffer = await resolveURL(buffer)

                let commands = processedBuffer.map(d => ({
                    replaceOne: {
                        filter: { "data.id": d.data.id },
                        replacement: d,
                        upsert: true
                    }
                }))

                await mongodb.bulkWrite({
                    db,
                    collection: PROCESSED,
                    commands
                })
                
                console.log(`Write processed attachements: ${buffer.length} items into ${PROCESSED}`)

                commands = buffer.map( (d, index ) => ({
                  replaceOne: {
                        filter: { "fileid": processedBuffer[index].data.id },
                        replacement: {
                          fileid: processedBuffer[index].data.id,
                          filepath: processedBuffer[index].data.path,
                          clinicalFilename: clinicalFileNames[index],
                          clinicalPatientId: d.patientId
                        },
                        upsert: true
                    }
                }))

                await mongodb.bulkWrite({
                    db,
                    collection: ENCODING,
                    commands
                })

                console.log(`Write file name encoding: ${buffer.length} items into ${ENCODING}`)
            
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

    } while (buffer.length > 0 && bufferCount < 1)

}


module.exports = execute 