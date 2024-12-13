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
          // crashed: {
          //   $exists: false
          // },
          "target.id": {
            $in: buffer.map( d => d.id)
          }
        }
      }
    ]
  })

  console.log(cross)

  // for(const d of buffer){

  //   let src = find(cross, c => c.target.id == d.id)
  //   if(!src){
  //     console.log(`${d.id}: IGNORE`)
  //   } else {
  //     console.log(`${d.id}: ${src.source.patientId} from ${src.source.collection}: ${src.source.id}`)
  //   }

  // } 

}

const execute = async COLLECTION => {



    console.log(`SYNC EXAMINATIONS FOR ${COLLECTION}`)
    
    const PAGE_SIZE = 20
    let skip = 0
    let bufferCount = 0

    do {

        const pipeline = [{
                '$match': {
                    process_sync: {
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
            console.log(buffer)
            let commands = []

            // if (buffer.length > 0) {

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

               
            // }

        }

        skip += buffer.length
        bufferCount++

    } while (buffer.length > 0 && bufferCount < 1)

}



module.exports = execute


