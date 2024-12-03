const mongodb = require("../../utils/mongodb")
const { first, last, groupBy} = require("lodash")

const db = require("../../../.config-migrate-db").mongodb.ade

const data = require("./test-path-all.json")

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

	total = 0

	for( const schema of schemas){

		let e = await mongodb.aggregate({
			db,
			collection: `${schema}${PREFIX}.examinations`,
			pipeline:[
				{
					$count: "count"
				}
			]
		})

		let l = await mongodb.aggregate({
			db,
			collection: `${schema}${PREFIX}.labels`,
			pipeline:[
				{
					$count: "count"
				}
			]
		})

		// res = res.map( d => {
		// 	d.schema = schema
		// 	return d
		// })

		console.log(`${schema} ${e[0].count} ${l[0].count}`)
	
	}


}

run()