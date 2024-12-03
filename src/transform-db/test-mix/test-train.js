const mongodb = require("../../utils/mongodb")
const { first, last, groupBy, difference} = require("lodash")

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
	"digiscope",
	"hha"
] 

const PREFIX = "-mix"


let buffer = []

const run = async () => {

	total = 0

	for( const schema of schemas){

		let res = await mongodb.aggregate({
			db,
			collection: `${schema}${PREFIX}.labels`,
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
						path: "$path"
					}
				}
			]
		})

		buffer = buffer.concat(res)

		console.log(`${schema} ${res.length}`)

		total += res.length
	
	}

	console.log(`Total ${total} ${data.length}`)

	// data = data.map()
	console.log(difference(data, buffer.map( b => b.path)))

}

run()