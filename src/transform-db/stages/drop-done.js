const mongodb = require("../../utils/mongodb")

const db = require("../../../.config-migrate-db").mongodb.ade

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

const run = async () => {


	for( const schema of schemas){

		console.log(`${schema}-done.labels`)

		await mongodb.drop({
			db,
			collection: `${schema}-done.labels`
		})
		
		console.log(`${schema}-done.examinations`)
		await mongodb.drop({
			db,
			collection: `${schema}-done.examinations`
		})

	}


}

run()