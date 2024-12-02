const mongodb = require("../../utils/mongodb")
const { first, last, groupBy} = require("lodash")

const db = require("../../../.config-migrate-db").mongodb.ade

const data = require("./train-path-all.json")

const schemas = [
	"potashev-part-1",
	"denis-part-1",
	"yoda",
	"harvest1",
	"phonendo",
	"strazhesko-part-1",
	"poltava-part-1",
	"digiscope"
] 

const run = async () => {


	for( const schema of schemas){

		console.log(`${schema}-mix.labels`)

		await mongodb.drop({
			db,
			collection: `${schema}-mix.examinations`
		})
		
		console.log(`${schema}-mix.labels`)
		await mongodb.drop({
			db,
			collection: `${schema}-mix.examinations`
		})

	}


}

run()