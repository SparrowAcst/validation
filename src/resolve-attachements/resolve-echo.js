// const yargs = require("yargs");
const execute = require("./utils/migrate-echo")

// const settings = yargs.argv;
const collection  = "8137d465-8583-44cc-883e-c2f39706a10c.forms" //settings.collection || settings.c 


const run = async () => {
  if(!collection) {
  	console.log("Collection required")
  	return
  }
  
  await execute(collection)

}

run()