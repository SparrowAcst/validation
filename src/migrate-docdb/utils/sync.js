const docdb = require("../../utils/docdb")
const mongodb = require("../../utils/mongodb")
const db = require("../../../.config-migrate-db").mongodb.ade
const find = require("lodash")

const CROSS_EXAMINATIONS = "ADE-TRANSFORM.cross-examinations"


const resolveBuffer = async buffer => {

  let cross = await mongodb.aggregate({
    db,
    collection: CROSS_EXAMINATIONS,
    pipeline: [
      {
        $match: {
          crashed: {
            $exists: false
          },
          "target.id": {
            $in: buffer.map( d => d.id)
          }
        }
      }
    ]
  })

  for(const d of buffer){

    let src = find(cross, c => c.target.id == d.id)
    if(!src){
      console.log(`${d.id}: IGNORE`)
    } else {
      console.log(`${d.id}: ${src.patientId} from ${src.collection}: ${src.id}`)
    }

  } 

}

const execute = async COLLECTION => {



    console.log(`SYNC EXAMINATIONS FOR ${COLLECTION}`)
    
    const PAGE_SIZE = 10
    let skip = 0
    let bufferCount = 0

    do {

        const pipeline = [{
                '$match': {
                    processsync: {
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

        buffer = await docdb.aggregate({
            collection: COLLECTION,
            pipeline
        })

        if (buffer.length > 0) {

            console.log(`DocDB: ${COLLECTION} > Read buffer ${bufferCount} started at ${skip}: ${buffer.length} items`)
            
            let commands = []

            if (buffer.length > 0) {

                await resolveBuffer(buffer)
                
        //         let i = 0
                
        //         for( let d of buffer){
        //             i++
        //             console.log(`${i} from ${buffer.length}`)
                    
        //             if(d){
                    
        //                 const process_records = await migrateFB2S3({
        //                     id: d.id,
        //                     fbUrl: d.Source.url
        //                 })
                        
        //                 commands.push({
        //                     updateOne: {
        //                         filter: { id: d.id },
        //                         update: {
        //                             $set:{
        //                               process_records  
        //                             }
        //                         },
        //                         upsert: true
        //                     }
        //                 })          
        //             }    
        //         }    

        //         if(commands.length > 0){
                    
        //             console.log(`${COLLECTION} > Update ${commands.length} items`)
            
        //             await mongodb.bulkWrite({
        //                 db,
        //                 collection: COLLECTION,
        //                 commands
        //             })
        //         }    

               
        //     }

        // }

        skip += buffer.length
        bufferCount++

    } while (buffer.length > 0 bufferCount < 1)

}




























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
        
        console.log("\n!!!!",objectBuffer.length)        
        
        if (objectBuffer.length > 0) {
                console.log(">>> ", objectBuffer.length)
                await docdb.insertAll({
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


