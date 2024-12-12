const execute = require("../utils/migrate")

const cross = require("./migrations/cross-tables")
const crash = require("./migrations/crash-tables")

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
		console.log(`Build cross tables for site: ${schema}: ${schema}${PREFIX} > ADE-TRANSFORM.cross-X`)
		await execute(cross(`${schema}${PREFIX}`, schema))		
	}

	console.log(`Build crash tables for site: ADE-TRANSFORM: ADE-TRANSFORM > ADE-TRANSFORM.cross-crash-X`)
	await execute(crash("ADE-TRANSFORM", "ADE-TRANSFORM"))
  
}

run()

