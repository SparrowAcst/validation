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

const run = async () => {

	total = 0

	for( const schema of schemas){

		let res = await mongodb.aggregate({
			db,
			collection: `${schema}-mix.labels`,
			pipeline:[
				{
				$match:{
					path:{
						$in: data
					}
				}
				},
				{
					$project:{
						_id: 0,
						id: "$uuid"
					}
				}
			]
		})

		// res = res.map( d => {
		// 	d.schema = schema
		// 	return d
		// })

		console.log(`${schema} ${res.length}`)

		total += res.length
	
	}

	console.log(`Total ${total} ${data.length}`)

}

run()