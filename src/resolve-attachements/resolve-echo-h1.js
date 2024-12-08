// const yargs = require("yargs");
const execute = require("./utils/migrate-echo-h1")

// const settings = yargs.argv;
const collection  = "sparrow.form-upd" //settings.collection || settings.c 


const run = async () => {
  if(!collection) {
  	console.log("Collection required")
  	return
  }
  
  await execute(collection)

}

run()