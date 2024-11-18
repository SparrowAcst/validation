const yargs = require("yargs");
const mongodb = require("../utils/mongodb")
const db = require("../../.config-migrate-db").mongodb.ade

const stages = require("./stages").map( (s, index) => {
  s.index = index + 1
  return s
})


const settings = yargs.argv;
let schema = settings.schema || "ATEST"
schema = (["sparrow", "settings", "admin"].includes(schema)) ? "ATEST" : schema

console.log(`TRANSFORM DATA STRUCTURES FOR SCHEMA "${schema}"`)

const run = async () => {
 
  for( const stage of stages){
    console.log(`Stage ${stage.index} of ${stages.length}: ${stage.command} collection "${schema}.${stage.collection}"`)
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

run()