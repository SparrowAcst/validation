const execute = require("./utils/migrate")

const migrations = require("./migrations/test")

const run = async () => {
  await execute(migrations)
}

run()


// const yargs = require("yargs");
// const mongodb = require("../utils/mongodb")
// const db = require("../../.config-migrate-db").mongodb.ade
// const fs = require("fs")
// const {parser} = require('stream-json/jsonl/Parser')
// const path = require("path")

// const settings = yargs.argv;

// const SOURCE = settings.s || settings.source
// const DEST = settings.d || settings.dest
// const filePath = path.join(__dirname,`../../../temp/dump.json`)

// console.log(`MIGRATE DATA "${SOURCE}" > "${DEST}"`)



// let objectBuffer = []
  
// const importCollectionData = async () => new Promise( (resolve, reject) => {
    
//     let readCounter = 0
//     let writeCounter = 0
//     const objectBufferSize = 1000


//     const fileStream = fs.createReadStream(filePath)
//     const jsonStream = parser()
    
//     fileStream.pipe(jsonStream);
    
//     jsonStream.on('data', async ({key, value}) => {
       
//        readCounter++
       
//        objectBuffer.push(value)
       
//        if(objectBuffer.length >= objectBufferSize){
 
//           jsonStream.pause()
//           if (objectBuffer.length > 0) {
//                 await mongodb.insertAll({
//                     db,
//                     collection: DEST,
//                     data: objectBuffer
//                 })

//             }
//           writeCounter += objectBuffer.length
//           objectBuffer = []
//           jsonStream.resume()
//        } 
       
//        process.stdout.write(`Read: ${readCounter}. Write: ${writeCounter}  ${'\x1b[0G'}`)

//     });

//     jsonStream.on('end', async () => {
        
//         if (objectBuffer.length > 0) {
//                 await mongodb.insertAll({
//                     db,
//                     collection: DEST,
//                     data: objectBuffer
//                 })

//             }
          
        
//         writeCounter += objectBuffer.length
//         objectBuffer = []

//         process.stdout.write(`${DEST} > Read: ${readCounter}. Write: ${writeCounter}  ${'\x1b[0G'}`)
//         // logger.info(`Read: ${readCounter}. Write: ${writeCounter}.`)
//         resolve()
//     })

//   }) 


// const run = async () => {

//   //////////////////////////////////// stage 1 ///////////////////////////////////////

//     const aggCursor = await mongodb.getAggregateCursor({
//       db,
//       collection: SOURCE
//     })
    
//     const source = aggCursor.cursor

//     const target = fs.createWriteStream(filePath)

//     let counter = 0
    
//     for await (const doc of source) {
//       counter++
//       process.stdout.write(`${SOURCE} > Export: ${counter} items into ${filePath}${'\x1b[0G'}`)
//       target.write(JSON.stringify(doc))
//       target.write("\n")  
//     }

//     await source.close()
//     target.end()

//     aggCursor.client.close()
    
//     console.log("\n\n")

//   //////////////////////////////////// stage 2 ///////////////////////////////////////
//    await  importCollectionData()
//    console.log("\n\n")
//    console.log("DONE")
// }





// // const run = async () => {

// //     if (!SOURCE || !DEST) {
// //         console.log("NO DATA")
// //         return
// //     }

// //     const PAGE_SIZE = 500

// //     let buffer = []
// //     let bufferCount = 0
// //     let skip = 0


// //     do {

// //         const pipeline = [{
// //                 '$match': {
// //                     migrated: {
// //                         $exists: false
// //                     }
// //                 }
// //             },
// //             {
// //                 '$limit': PAGE_SIZE
// //             },
// //             {
// //               $project: {
// //                 _id: 0
// //               }
// //             }
// //         ]

// //         buffer = await mongodb.aggregate({
// //             db,
// //             collection: SOURCE,
// //             pipeline
// //         })
// //         if (buffer.length > 0) {
// //             console.log(`${SOURCE} > Read buffer ${bufferCount}: starts at ${skip} ${buffer.length} items`)
// //             // console.log(buffer.map(b => b.id).join("\n"))

// //             if (buffer.length > 0) {
// //                 await mongodb.insertAll({
// //                     db,
// //                     collection: DEST,
// //                     data: buffer
// //                 })

// //             }

// //             // let ops = buffer.map(b => ({
// //             //     replaceOne: {
// //             //         "filter": { id: b.id },
// //             //         "replacement": b,
// //             //         "upsert": true
// //             //     }
// //             // }))

// //             // if (ops.length > 0) {
// //             //     await mongodb.bulkWrite({
// //             //         db,
// //             //         collection: DEST,
// //             //         commands: ops
// //             //     })
// //             // }

// //             console.log(`${DEST} > Write ${buffer.length} items`)

// //             await mongodb.updateMany({
// //                 db,
// //                 collection: SOURCE,
// //                 filter: {id: { $in: buffer.map(d => d.id)}},
// //                 data: {
// //                   migrated: true
// //                 }
// //             })


// //             // ops = buffer.map(b => ({
// //             //     updateOne: {
// //             //         "filter": { id: b.id },
// //             //         "update": {
// //             //             $set: { migrated: true }
// //             //         }
// //             //     }
// //             // }))

// //             // if (ops.length > 0) {
// //             //     await mongodb.bulkWrite({
// //             //       db,
// //             //       collection:SOURCE, 
// //             //       commands: ops
// //             //     })
// //             // }

// //         }

// //         skip += buffer.length
// //         bufferCount++

// //     } while (buffer.length > 0)

// // }

// run()


