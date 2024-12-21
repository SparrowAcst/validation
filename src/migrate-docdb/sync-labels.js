const execute = require("./utils/sync-labels")

const schemas = [
	"digiscope",
	// "phonendo",
	// "denis-part-1",
	// "potashev-part-1",
	// "poltava-part-1",
	// "strazhesko-part-1",
	// "harvest1",
	// "hha",
	// "yoda"
]

const run = async () => {
  for( const schema of schemas){
  	await execute(schema)	
  }		
  
}

run()

