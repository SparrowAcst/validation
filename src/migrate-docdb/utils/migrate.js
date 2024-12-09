const docdb = require("../../utils/docdb")

const mongodb = require("../../utils/mongodb")
const db = require("../../../.config-migrate-db").mongodb.ade
const fs = require("fs")
const {parser} = require('stream-json/jsonl/Parser')
const path = require("path")

const filePath = path.join(__dirname,`../../../../temp/dump.json`)

let objectBuffer = []
  
const importCollectionData = async DEST => new Promise( (resolve, reject) => {
    
    let readCounter = 0
    let writeCounter = 0
    const objectBufferSize = 1000


    const fileStream = fs.createReadStream(filePath)
    const jsonStream = parser()
    
    fileStream.pipe(jsonStream);
    
    jsonStream.on('data', async ({key, value}) => {
       
       readCounter++
       
       objectBuffer.push(value)
       
       if(objectBuffer.length >= objectBufferSize){
 
          jsonStream.pause()
          if (objectBuffer.length > 0) {
                await docdb.insertAll({
                    collection: DEST,
                    data: objectBuffer
                })

            }
          writeCounter += objectBuffer.length
          objectBuffer = []
          jsonStream.resume()
       } 
       
       process.stdout.write(`Read: ${readCounter}. Write: ${writeCounter}  ${'\x1b[0G'}`)

    });

    jsonStream.on('end', async () => {
        
        if (objectBuffer.length > 0) {
                await mongodb.insertAll({
                    db,
                    collection: DEST,
                    data: objectBuffer
                })

            }
          
        
        writeCounter += objectBuffer.length
        objectBuffer = []

        process.stdout.write(`${DEST} > Read: ${readCounter}. Write: ${writeCounter}  ${'\x1b[0G'}`)
        // logger.info(`Read: ${readCounter}. Write: ${writeCounter}.`)
        resolve()
    })

  }) 


const run = async (SOURCE, DEST, pipeline) => {

  console.log(`MIGRATE collection "Atlas: ${SOURCE}" > DocDB: "${DEST}"`)
  console.log(pipeline)

  pipeline = pipeline || []

  //////////////////////////////////// stage 1 ///////////////////////////////////////

    const aggCursor = await mongodb.getAggregateCursor({
      db,
      collection: SOURCE,
      pipeline
    })
    
    const source = aggCursor.cursor

    const target = fs.createWriteStream(filePath)

    let counter = 0
    
    for await (const doc of source) {
      counter++
      process.stdout.write(`${SOURCE} > Export: ${counter} items into ${filePath}${'\x1b[0G'}`)
      target.write(JSON.stringify(doc))
      target.write("\n")  
    }

    await source.close()
    target.end()

    aggCursor.client.close()
    
    console.log()

  //////////////////////////////////// stage 2 ///////////////////////////////////////
   await  importCollectionData(DEST)
   console.log()
   console.log("DONE")
}



const execute = async migrationList => {

  let count = 0

  for( let migration of migrationList) {
    console.log(`MIGRATE ${count+1} of ${migrationList.length}`)
    count++
    await run(migration.source, migration.dest, migration.pipeline)
  }


}


// const execute = async () => {
//   let res = await docdb.aggregate({
//     collection: "test-dataset.examinations",
//     pipeline:[
//       {
//         $limit: 5
//       },
//       {
//         $project: {
//           _id: 0
//         }
//       }
//     ]
//   })

//   console.log(res)
// }


module.exports = execute


