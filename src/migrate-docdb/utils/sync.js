const docdb = require("../../utils/docdb")
const mongodb = require("../../utils/mongodb")
const db = require("../../../.config-migrate-db").mongodb.ade
const { find, groupBy, keys } = require("lodash")

const CROSS = "ADE-TRANSFORM.cross-examinations"


const resolveBuffer = async (buffer, COLLECTION) => {

  let cross = await mongodb.aggregate({
    db,
    collection: CROSS,
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

  let res = buffer.map( d => {

    let src = find(cross, c => c.target.id == d.id)
    
    if(!src){
      console.log(`${d.id}: IGNORE`)
      return
    } else {
      console.log(`${COLLECTION}.${d.id}: ${src.source.patientId} from ${src.source.collection}`)
      return src
    }

  })

  res = groupBy(res, d => d.source.collection)

  res = keys(res).map(key => ({
    collection: key,
    pipeline: [
        {
            $match: {
                "Examination ID":{
                    $in: res[key].map(d => d.source.patientId)
                }
            }
        },
        {
            $project: {
                _id: 0
            }
        }
    ]
  }))


  console.log(JSON.stringify(res, null, " "))

}

const execute = async COLLECTION => {



    console.log(`SYNC EXAMINATIONS FOR ${COLLECTION}`)
    
    const PAGE_SIZE = 70
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
            // console.log(buffer)
            let commands = []

            // if (buffer.length > 0) {

                await resolveBuffer(buffer, COLLECTION)
                
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


