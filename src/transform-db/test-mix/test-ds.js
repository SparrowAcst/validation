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

// node ./src/transform-db/stages/transform 8 10 100

const PREFIX = "-mix"


const run = async () => {


    for (const schema of schemas) {

        let res = await mongodb.aggregate({
            db,
            collection: `${schema}${PREFIX}.labels`,
            pipeline: [{
                $group: {
                    _id: "$model",
                    count: {
                        $count: {},
                    },
                },
            }]
        })

        console.log(`${schema} device`)
        res.forEach(r => {
            console.log(`${r._id} ${r.count}`)
        })

    }

    for (const schema of schemas) {

        let res = await mongodb.aggregate({
            db,
            collection: `${schema}${PREFIX}.labels`,
            pipeline: [{
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

    for (const schema of schemas) {

        let res = await mongodb.aggregate({
            db,
            collection: `${schema}${PREFIX}.labels`,
            pipeline: [{
                $group: {
                    _id: "$Sex at Birth",
                    count: {
                        $count: {},
                    },
                },
            }, ]
        })

        console.log(`${schema} Sex at Birth`)
        res.forEach(r => {
            console.log(`${r._id} ${r.count}`)
        })

    }

    for (const schema of schemas) {

        let res = await mongodb.aggregate({
            db,
            collection: `${schema}${PREFIX}.labels`,
            pipeline: [{
                $group: {
                    _id: "$Sex at Birth",
                    count: {
                        $count: {},
                    },
                },
            }, ]
        })

        console.log(`${schema} Sex at Birth`)
        res.forEach(r => {
            console.log(`${r._id} ${r.count}`)
        })

    }




}

run()