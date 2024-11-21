const mongodb = require("../../utils/mongodb")

const db = require("../../../.config-migrate-db").mongodb.ade


const execute = async (schema, stages) => {
  
  schema = schema || "ATEST"
  schema = (["sparrow", "settings", "admin"].includes(schema)) ? "ATEST" : schema

  console.log(`TRANSFORM DATA STRUCTURES FOR SCHEMA "${schema}"`)
  
  let count = 0 

  for( const stage of stages){
  
    console.log(`Stage ${count} of ${stages.length}: ${stage.command} collection "${schema}.${stage.collection}"`)
    count++
    stage.dataset = stage.dataset || (d => true)
    if(stage.dataset(schema)){
      await mongodb[stage.command]({
        db,
        collection: `${schema}.${stage.collection}`,
        pipeline: stage.pipeline
      })
    
    } else {
    
      console.log("IGNORE")
    
    }  
  }  

}

module.exports = execute