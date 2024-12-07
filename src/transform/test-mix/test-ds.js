const mongodb = require("../../utils/mongodb")
const { first, last, groupBy } = require("lodash")

const db = require("../../../.config-migrate-db").mongodb.ade

// const data = require("./test-ids.json").map(d => d.id)
// const data1 = require("./train-ids.json").map(d => d.id)

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

const run = async () => {

console.log("---------------------- RECORDS ---------------------")
    for (const schema of schemas) {

        let res = await mongodb.aggregate({
            db,
            collection: `${schema}${PREFIX}.labels`,
            pipeline: [
                {
                    $count: "count"
                }
            ]
        })

        res.forEach(r => {
            console.log(`${schema} ${r.count}`)
        })

    }

console.log("---------------------- PATIENTS ---------------------")

    for (const schema of schemas) {

        let res = await mongodb.aggregate({
            db,
            collection: `${schema}${PREFIX}.labels`,
            pipeline: [
            {
                $group: {
                    _id: "$Examination ID",
                    count: {
                        $count: {},
                    },
                },
            }]
        })

            console.log(`${schema} ${res.length}`)

    }

}

run()