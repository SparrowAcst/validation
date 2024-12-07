const execute = require("../utils/migrate")

const migrations = require("./migrations/encode")


const schemas = [
	"potashev-part-1",
	"denis-part-1",
	"yoda",
	"harvest1",
	"phonendo",
	"strazhesko-part-1",
	"poltava-part-1",
	"digiscope",
	"hha"
] 

const PREFIX = "-mix"



const run = async () => {
  
	for( const schema of schemas){
		await execute(migrations(`${schema}${PREFIX}`))		
	}
  
}

run()

