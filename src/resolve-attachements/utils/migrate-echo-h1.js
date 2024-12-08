const mongodb = require("../../utils/mongodb")
const fs = require("fs")
const path = require("path")
const s3bucket = require("../../utils/s3-bucket")
const filesize = require("file-size")
const uuid = require("uuid").v4
const { extension, lookup } = require("mime-types")
const { first, last, find, set } = require("lodash")

// const hh = require("./RESOLVED-ECHO-URL.json")

const db = require("../../../.config-migrate-db").mongodb.ade

const DEST = "ADE-ECHOS/"

// const resolveSource = d => {
//     if (d.storage == "s3") return "S3"
//     if (/^\.\/api\/controller\/file\/gd\?id/.test(d.url)) return "GD"
//     if (/^https\:\/\/firebasestorage\.googleapis\.com/.test(d.url)) return "FB"

// }


const resolveSource = d => {
    
    if( !d || !d.data || !d.data.en) return
    
    if (d.data.en.dataStorage == "s3") return "S3"
    if (/^https\:\/\/drive\.google\.com\/file\/d/.test(d.data.en.dataUrl)) return "GD"

}

// const resolvers = {

//     GD: async d => {

//         if (!d) {
//             return {
//                 error: "no data"
//             }
//         }

//         let id = uuid()

//         let source
//         let target

//         try {

//             source = last(d.url.split("?id="))
//             target = `${DEST}${id}${path.extname(d.publicName)}`


//             const googleDrive = await require("../../utils/drive3")()
//             const drive = await googleDrive.create()
//             let stream = await drive.geFiletWriteStream({ id: source })

//             await s3bucket.uploadFromStream({
//                 stream,
//                 target,
//                 callback: progress => {
//                     process.stdout.write(`COPY FROM GD > ${filesize(progress.loaded).human("jedec")} > ${target}         ${'\x1b[0G'}`)
//                 }
//             })
//             console.log()
//             return {
//                 type: "GD",
//                 id,
//                 source,
//                 target,
//                 path: target
//             }
//         } catch (e) {

//             console.log(e.toString(), e.stack)
//             return {
//                 type: "GD",
//                 id,
//                 source,
//                 target,
//                 error: `${e.toString()} ${e.stack}`
//             }

//         }
//     },

//     FB: async d => {

//         if (!d) {
//             return {
//                 error: "no data"
//             }
//         }

//         let id = uuid()

//         let mimeType
//         let source
//         let target

//         try {

//             mimeType = d.mimeType || "application/octet-stream"
//             mimeType = (mimeType == "application/octet-stream" || mimeType == "image") ? "image/jpeg" : mimeType

//             source = `${d.url}`
//             target = `${ DEST }${ id }.${ extension(mimeType) }`

//             await s3bucket.uploadFromURL({
//                 source,
//                 target,
//                 callback: (progress) => {
//                     process.stdout.write(`COPY FROM FB > ${filesize(progress.loaded).human("jedec")} > ${target}     ${'\x1b[0G'}`)
//                 }
//             })

//             console.log()

//             return {
//                 type: "FB",
//                 id,
//                 source,
//                 target,
//                 path: target
//             }

//         } catch (e) {
//             console.log(e.toString(), e.stack)
//             return {
//                 type: "FB",
//                 id,
//                 source,
//                 target,
//                 error: `${e.toString()} ${e.stack}`
//             }
//         }
//     },

//     S3: async d => {

//         if (!d) {
//             return {
//                 error: "no data"
//             }
//         }

//         let id = uuid()
//         let source
//         let target

//         try {

//             source = `${d.path}`
//             target = `${DEST}${id}${path.extname(d.path)}`


//             let meta = await s3bucket.metadata(source)
//             if (!meta) {
//                 return {
//                     type: "S3",
//                     id,
//                     source,
//                     target,
//                     error: `Source "${source}" not exists`
//                 }
//             }

//             await s3bucket.copy({
//                 source,
//                 target,
//                 callback: ({ sourceBucketAlias, sourceKey, destinationBucketAlias, destinationKey }) => {
//                     console.log(`${sourceBucketAlias}:${sourceKey} > ${destinationBucketAlias}:${destinationKey}`)
//                 }
//             })

//             console.log()

//             return {
//                 type: "S3",
//                 id,
//                 source,
//                 target,
//                 path: target
//             }

//         } catch (e) {
//             console.log(e.toString(), e.stack)
//             return {
//                 type: "S3",
//                 id,
//                 source,
//                 target,
//                 error: `${e.toString()} ${e.stack}`
//             }
//         }
//     }

// }



// const resolveURL = async buffer => {

//     buffer = buffer //.filter(d => d && d)
//     let result = []

//     for (let d of buffer) {

//         if (d) {

//             let resolver = resolvers[resolveSource(d)]
//             if (resolver) {

//                 let res = await resolver(d)

//                 if (!res.error) {

//                     d.id = res.id
//                     d.path = res.path
//                     d.name = last(res.path.split("/"))
//                     d.publicName = d.name
//                     d.mimeType = lookup(d.publicName)
//                     d.storage = "s3"
//                     d.url = await s3bucket.getPresignedUrl(res.path)

//                 } else {
//                     d.error = res
//                 }

//             } else {
//                 d.error = "No resolver"
//             }
//         } else {
//             d.error = "data is undefined or null"
//         }

//         d.migratedAt = new Date()
//         result.push(d)

//     }

//     return result
// }

const resolvers = {

    // GD: async d => {

    //     if (!d.data || !d.data.en) {
    //         return {
    //             error: "no data"
    //         }
    //     }

    //     let id = uuid()

    //     let source
    //     let target

    //     try {

    //         source = d.data.en.dataUrl.split("/")[5]
            

    //         const googleDrive = await require("../../utils/drive3")()
    //         const drive = await googleDrive.create()
            
    //         const metadata = await drive.getFileMetadata(source)
    //         const dataFileName = metadata.data.name
            
    //         target = `${DEST}${id}${path.extname(dataFileName)}`


    //         let stream = await drive.geFiletWriteStream({ id: source })

    //         await s3bucket.uploadFromStream({
    //             stream,
    //             target,
    //             callback: progress => {
    //                 process.stdout.write(`COPY FROM GD > ${filesize(progress.loaded).human("jedec")} > ${target}        ${'\x1b[0G'}`)
    //             }
    //         })
            
    //         console.log()

    //         return {
    //             type: "GD",
    //             id,
    //             source,
    //             target,
    //             path: target
    //         }
    //     } catch (e) {

    //         console.log(e.toString(), e.stack)
    //         return {
    //             type: "GD",
    //             id,
    //             source,
    //             target,
    //             error: `${e.toString()} ${e.stack}`
    //         }

    //     }
    // },


    S3: async d => {

        if (!d.data || !d.data.en) {
            return {
                error: "no data"
            }
        }

        let id = uuid()

        let source
        let target

        try {

            source = `H1-ECHOS/${d.patientId}.zip`
            target = `${DEST}${id}.zip`

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



const resolveURL = async dataBuffer => {

    buffer = dataBuffer.filter(d => d && d.data && d.data.en)
    console.log(`RESOLVE URL for ${buffer.map(d => d.patientId)}`)
    
    let result = dataBuffer
        .filter( d => !buffer.map( b => b.patientId).includes(d.patientId))
        .map( d => {
            d.error = "no data"
            d.migratedAt = new Date()
            return d
        })

    let idx = 0
    for (let d of buffer) {
        idx++
        if (d) {

            console.log(`Patient ${idx}: ${d.patientId} ${!!d.data.en}`)

            
            let resolver = resolvers["S3"]
            console.log(`Resolver: ${!!resolver}`)
            if (resolver) {

                let res = await resolver(d)

                // console.log(res)

                if (!res.error) {

                  d.data.en.dataUrl = await (s3bucket.getPresignedUrl(res.path))
                  d.data.en.dataFileName = last(res.path.split("/"))
                  d.data.en.dataStorage = "s3"
                  d.data.en.dataPath = res.path  
                  
                  d.data.en.resolvedData = {
                    dataUrl: await (s3bucket.getPresignedUrl(res.path)),
                    dataFileName: last(res.path.split("/")),
                    dataStorage: "s3",
                    dataPath: res.path,
                  }  
                  
                } else {
                    d.data.en.resolvedData = {
                      error: res  
                    }
                }

            } else {
                d.data.en.resolvedData = {
                      error: "No resolver"  
                }
            }
        } else {
            d.data.en.resolvedData = {
                error: "data is undefined or null"  
            }
        }

        d.migratedAt = new Date()
        result.push(d)

    }

    return result
}





const execute = async formCollection => {

    const SOURCE = `${formCollection}`
    const PROCESSED = `${formCollection}_processed`



    console.log(`RESOLVE ECHOS FOR ${formCollection}`)

    const PAGE_SIZE = 10
    let skip = 0
    let bufferCount = 0

    do {

        const pipeline = [{
                '$match': {
                    type: "echo",
                    patientId: {
                        $exists: true
                    },
                    process_echo: {
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

            console.log(`${SOURCE} > Read buffer ${bufferCount} started at ${skip+1} item: ${buffer.length} items`)

            if (buffer.length > 0) {

                let processedBuffer = await resolveURL(buffer)

                let commands = processedBuffer.map(d => ({
                    updateOne: {
                        filter: { "id": d.id },
                        update: {
                            $set:{
                               
                               process_echo: true,
                               error: d.error,
                               "data.en.dataUrl": (!d.error) ? d.data.en.dataUrl : null,
                               "data.en.dataFileName": (!d.error) ? d.data.en.dataFileName: null,
                               "data.en.dataStorage": (!d.error) ? d.data.en.dataStorage : null,
                               "data.en.dataPath": (!d.error) ? d.data.en.dataPath: null, 
                  
                               "data.en.resolvedData": (!d.error) ? d.data.en.resolvedData: null
                            }    
                        },
                        upsert: true
                    }
                }))

                console.log(`${SOURCE} > Write buffer ${bufferCount} : ${buffer.length} items`)

                if(commands.length > 0){
                    await mongodb.bulkWrite({
                        db,
                        collection: SOURCE,
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

