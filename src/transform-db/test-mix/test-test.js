const mongodb = require("../../utils/mongodb")
const { first, last, groupBy } = require("lodash")

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
        if(schema == "digiscope") {
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

        total += res.length

    }

    total = 0

    console.log(`Total ${total} ${data.length}`)




    console.log("------------------- MODELS ----------------------------")

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

        // buffer = buffer.concat(res)
        res.forEach(r => {
            console.log(`${schema} ${r._id} ${r.count}`)
        })
        // if(schema == "digiscope") {
        // 	console.log(res)
        // }
        total += res.length

    }

    console.log("------------------- MURMURS ----------------------------")

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


            ]
        })


        res.forEach(r => {
            console.log(`${schema} ${r._id} ${r.count}`)
        })


    }

    console.log("------------------- Ethnicity ----------------------------")


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

        console.log(`${schema} Ethnicity`)
        res.forEach(r => {
            console.log(`${r._id} ${r.count}`)
        })

    }

    console.log("------------------- Sex ----------------------------")



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

        console.log(`${schema} Sex`)
        res.forEach(r => {
            console.log(`${r._id} ${r.count}`)
        })

    }





}

run()