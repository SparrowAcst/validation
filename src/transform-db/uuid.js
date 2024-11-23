const yargs = require("yargs");
const uuid = require("uuid").v4

const settings = yargs.argv;

const count  = settings.count || 3

for(let i=0; i< count; i++){
    console.log(`"${uuid()}"`)
}