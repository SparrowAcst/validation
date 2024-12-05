const mongodb = require("../../utils/mongodb")
const { first, last, groupBy, flatten, keys, find } = require("lodash")

const db = require("../../../.config-migrate-db").mongodb.ade

const data = require("./test-path-all.json")
// const data = require("./train-path-all.json")

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

    let total = 0

    console.log("------------------- RECORDS ----------------------------")

    for (const schema of schemas) {

        let res = await mongodb.aggregate({
            db,
            collection: `${schema}${PREFIX}.labels`,
            pipeline: [{
                    $match: {
                        path: {
                            $in: data
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        id: "$uuid",
                        path: "$path"
                    }
                }
            ]
        })

        console.log(`${schema} ${res.length}`)
        if(schema == "yoda") {
			console.log(res)
		}
        total += res.length

    }

    total = 0

    console.log(`Total ${total} ${data.length}`)


    console.log("------------------- PATIENTS ----------------------------")

    for (const schema of schemas) {

        let res = await mongodb.aggregate({
            db,
            collection: `${schema}${PREFIX}.labels`,
            pipeline: [{
                    $match: {
                        path: {
                            $in: data
                        }
                    }
                },
                {
                    $group: {
                        _id: "$Examination ID"
                    },
                }

            ]
        })

        console.log(`${schema} ${res.length}`)
        if(schema == "yoda") {
			console.log(res)
		}
  
        total += res.length

    }



    console.log("------------------- MODELS ----------------------------")

    let buffer = []
    
    for (const schema of schemas) {

        let res = await mongodb.aggregate({
            db,
            collection: `${schema}${PREFIX}.labels`,
            pipeline: [{
                    $match: {
                        path: {
                            $in: data
                        }
                    }
                },
                {
                    $group: {
                        _id: "$model",
                        count: {
                            $count: {},
                        },
                    },
                }
            ]
        })

        buffer = buffer.concat(res)
        res.forEach(r => {
            console.log(`${schema} ${r._id} ${r.count}`)
        })
        
    }


    console.log("------------------------------------------------------")
    let models = groupBy(flatten(buffer), d => d._id )
    models = keys(models).map(k => ({
    	_id: k,
    	count: models[k].map(d => d.count).reduce((a,b) => a+b, 0)
    }))
    models.forEach(r => {
        console.log(`${r._id} ${r.count}`)
    })

    console.log("------------------- MURMURS ----------------------------")

    console.log(`schema false true`)
    for (const schema of schemas) {

        let res = await mongodb.aggregate({
            db,
            collection: `${schema}${PREFIX}.labels`,
            pipeline: [{
                    $match: {
                        path: {
                            $in: data
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        "Examination ID": 1,
                        s: {
                            $first: "$Systolic murmurs",
                        },
                        d: {
                            $first: "$Diastolic murmurs",
                        },
                        o: {
                            $first: "$Other murmurs",
                        },
                    },
                },
                {
                    $addFields: {
                        murmurs: {
                            $or: [{
                                    $and: [{
                                            $ifNull: ["$s", false],
                                        },
                                        {
                                            $ne: [
                                                "$s",
                                                "No systolic murmurs",
                                            ],
                                        },
                                    ],
                                },
                                {
                                    $and: [{
                                            $ifNull: ["$d", false],
                                        },
                                        {
                                            $ne: [
                                                "$d",
                                                "No diastolic murmurs",
                                            ],
                                        },
                                    ],
                                },
                                {
                                    $and: [{
                                            $ifNull: ["$o", false],
                                        },
                                        {
                                            $ne: ["$o", "No Other Murmurs"],
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                },
                {
                    $group: {
                        _id: "$murmurs",
                        count: {
                            $count: {},
                        },
                    },
                },
                {
                	$sort: {
                		murmurs: 1
                	}
                }

            ]
        })

        res = [
        	(find(res, d => d._id == false)) ? find(res, d => d._id == false).count : 0,
        	(find(res, d => d._id == true)) ? find(res, d => d._id == true).count : 0,
        ]

        
        // res.forEach(r => {
            console.log(`${schema} ${res[0]} ${res[1]}`)
        // })


    }

    console.log("------------------- Ethnicity ----------------------------")


    buffer = []
    for (const schema of schemas) {

        let res = await mongodb.aggregate({
            db,
            collection: `${schema}${PREFIX}.labels`,
            pipeline: [
            {
				$match:{
					path:{
						$in: data
					}
				}
				},
				{
                $group: {
                    _id: "$Ethnicity",
                    count: {
                        $count: {},
                    },
                },
            }, ]
        })

        buffer = buffer.concat(res)
        console.log(`${schema} Ethnicity`)
        res.forEach(r => {
            console.log(`${r._id} ${r.count}`)
        })

    }

    console.log("------------------------------------------------------")
    let eths = groupBy(flatten(buffer), d => d._id )
    eths = keys(eths).map(k => ({
    	_id: k,
    	count: eths[k].map(d => d.count).reduce((a,b) => a+b, 0)
    }))
    eths.forEach(r => {
        console.log(`${r._id} ${r.count}`)
    })


    console.log("------------------- Sex ----------------------------")

    buffer = []

    for (const schema of schemas) {

        let res = await mongodb.aggregate({
            db,
            collection: `${schema}${PREFIX}.labels`,
            pipeline: [{
				$match:{
					path:{
						$in: data
					}
				}
				},
				{
                $group: {
                    _id: "$Sex at Birth",
                    count: {
                        $count: {},
                    },
                },
            }, ]
        })

        res = res.map( d => {
        	d._id = `"${d._id}"`
        	return d
        })

        buffer = buffer.concat(res)

        console.log(`${schema} Sex`)
        res.forEach(r => {
            console.log(`${r._id} ${r.count}`)
        })

    }

    console.log("------------------------------------------------------")
    let sex = groupBy(flatten(buffer), d => d._id )
    sex = keys(sex).map(k => ({
    	_id: (k) ? k : "n/a",
    	count: sex[k].map(d => d.count).reduce((a,b) => a+b, 0)
    }))
    sex.forEach(r => {
        console.log(`${r._id} ${r.count}`)
    })


}

run()