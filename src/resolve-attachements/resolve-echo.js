// const yargs = require("yargs");
const execute = require("./utils/migrate-files")

// const settings = yargs.argv;
const collection  = "HH1.forms" //settings.collection || settings.c 


const run = async () => {
  if(!collection) {
  	console.log("Collection required")
  	return
  }
  
  await execute(collection)

}

run()