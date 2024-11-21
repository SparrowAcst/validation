const execute = require("./utils/migrate-echo")

const SCHEMA = "HH3"

const run = async () => {
  await execute(SCHEMA)
}

run()




// const mongodb = require("../utils/mongodb")
// const fs = require("fs")
// const path = require("path")
// const s3bucket = require("../utils/s3-bucket")
// const filesize = require("file-size")
// const uuid = require("uuid").v4
// const { extension, lookup } = require("mime-types")
// const { first, last, extend } = require("lodash")

// const SOURCE = "HH3.echo"
// const PROCESSED = "HH3.echo_processed"
// const ENCODING = "ADE_ENCODING.HH3_echos"

// const DEST = "ADE-ECHOS/"

// const db = require("../../.config-migrate-db").mongodb.ade


// const resolveSource = d => {
    
//     if( !d || !d.data || !d.data.en) return
    
//     if (d.data.en.dataStorage == "s3") return "S3"
//     if (/^https\:\/\/drive\.google\.com\/file\/d/.test(d.data.en.dataUrl)) return "GD"

// }

// const resolvers = {

//     GD: async d => {

//         if (!d.data || !d.data.en) {
//             return {
//                 error: "no data"
//             }
//         }

//         let id = d.dataFileId

//         let source
//         let target

//         try {

//             source = d.data.en.dataUrl.split("/")[5]
//             target = `${DEST}${id}${path.extname(d.data.en.dataFileName)}`


//             const googleDrive = await require("../utils/drive3")()
//             const drive = await googleDrive.create()
//             let stream = await drive.geFiletWriteStream({ id: source })

//             await s3bucket.uploadFromStream({
//                 stream,
//                 target,
//                 callback: progress => {
//                     process.stdout.write(`COPY FROM GD > ${filesize(progress.loaded).human("jedec")} > ${target}        ${'\x1b[0G'}`)
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


//     S3: async d => {

//         if (!d.data || !d.data.en) {
//             return {
//                 error: "no data"
//             }
//         }

//         let id = d.dataFileId

//         let source
//         let target

//         try {

//             source = `${d.data.en.dataPath}`
//             target = `${DEST}${id}${path.extname(last(d.data.en.dataPath.split("/")))}`

//             let meta = await s3bucket.metadata(source)
//             if(!meta){
//               return {
//                   type: "S3",
//                   id,
//                   source,
//                   target,
//                   error: `Source "${source}" not exists`
//               }
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

//     buffer = buffer //.filter(d => d && d.data)
//     let result = []

//     for (let d of buffer) {

//         if (d) {

//             let resolver = resolvers[resolveSource(d)]
//             if (resolver) {

//                 let res = await resolver(d)

//                 // console.log(res)

//                 if (!res.error) {

//                   d.data.en.dataUrl = await (s3bucket.getPresignedUrl(res.path))
//                   d.data.en.dataFileName = last(res.path.split("/"))
//                   d.data.en.dataStorage = "s3"
//                   d.data.en.dataPath = res.path
      
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


// const run = async () => {

//     const PAGE_SIZE = 1
//     let skip = 0
//     let bufferCount = 0

//     do {

//         const pipeline = [{
//                 '$match': {
//                     process_echo: {
//                         $exists: false
//                     }
//                 }
//             },
//             {
//                 '$limit': PAGE_SIZE
//             },
//             {
//                 $project: {
//                     _id: 0
//                 }
//             }
//         ]

//         buffer = await mongodb.aggregate({
//             db,
//             collection: SOURCE,
//             pipeline
//         })

//         if (buffer.length > 0) {
            
//             console.log(`${SOURCE} > Read buffer ${bufferCount} started at ${skip}: ${buffer.length} items`)

//             if (buffer.length > 0) {

//                 let clinicalData = buffer.map( b => (b && b.data && b.data.en) 
//                   ?
//                   {
//                     clinicalDataUrl: b.data.en.dataUrl,
//                     clinicalDataFileName: b.data.en.dataFileName,
//                     clinicalDataStorage: b.data.en.dataStorage,
//                     clinicalDataPath: b.data.en.dataPath,
//                     clinicalPatientId: b.patientId
//                   }
//                 : undefined
//               )
                
//                 let processedBuffer = await resolveURL(buffer)

//                 // console.log(JSON.stringify(processedBuffer, null, " "))

//                 let commands = processedBuffer.map(d => ({
//                     replaceOne: {
//                         filter: { "id": d.id },
//                         replacement: d,
//                         upsert: true
//                     }
//                 }))

                
//                 console.log(`Write processed attachements: ${buffer.length} items into ${PROCESSED}`)

//                 await mongodb.bulkWrite({
//                     db,
//                     collection: PROCESSED,
//                     commands
//                 })
                
                
//                 commands = buffer.map( (d, index ) => ({
//                   replaceOne: {
//                         filter: { "clinicalPatientId": clinicalData[index].clinicalPatientId },
//                         replacement: extend(
//                           {},
//                           clinicalData[index],
//                           {
//                             dataUrl: d.data.en.dataUrl,
//                             dataFileName: d.data.en.dataFileName,
//                             dataStorage: d.data.en.dataStorage,
//                             dataPath: d.data.en.dataPath,
//                           }
//                         ),
//                         upsert: true
//                     }
//                 }))

//                 await mongodb.bulkWrite({
//                     db,
//                     collection: ENCODING,
//                     commands
//                 })

//                 console.log(`Write file name encoding: ${buffer.length} items into ${ENCODING}`)
            
//             }

//             await mongodb.updateMany({
//                 db,
//                 collection: SOURCE,
//                 filter: { "id": { $in: buffer.map(d => d.id) } },
//                 data: {
//                     process_echo: true
//                 }
//             })

//         }

//         skip += buffer.length
//         bufferCount++

//     } while (buffer.length > 0 && bufferCount < 1)

// }


// run()