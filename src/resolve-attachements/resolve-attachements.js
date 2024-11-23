const yargs = require("yargs");
const execute = require("./utils/migrate-files")

const settings = yargs.argv;
const collection  = settings.collection || settings.c 


const run = async () => {
  if(!collection) {
  	console.log("Collection required")
  	return
  }
  
  await execute(collection)

}

run()