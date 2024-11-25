// const yargs = require("yargs");
const execute = require("./utils/migrate-echo")

// const settings = yargs.argv;
const collection  = "sparrow.H2-FORM" //settings.collection || settings.c 


const run = async () => {
  if(!collection) {
  	console.log("Collection required")
  	return
  }
  
  await execute(collection)

}

run()