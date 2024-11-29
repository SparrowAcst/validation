
const execute = require("../utils/aiseg")

const schemas = [
	"strazhesko-part-1",
	"potashev-part-1",
	"denis-part-1",
	"poltava-part-1",
	"yoda",
]

const run = async () => {

	for (const schema of schemas){
		await execute(schema)	
	}
    
}

run()

