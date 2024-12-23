const docdb = require("../../utils/docdb")
const mongodb = require("../../utils/mongodb")
const db = require("../../../.config-migrate-db").mongodb.ade
const { find, groupBy, keys, first, last, isUndefined, flatten } = require("lodash")
const Diff = require("./diff")
const uuid = require("uuid").v4

const sanitizePipeline = require("./sanitize-pipelines")

const UPDATE_ID = uuid()

const CROSS = "ADE-TRANSFORM.crash-examinations"
const SOURCE = "ADE-TRANSFORM.examinations"
const TARGET = "ADE-TRANSFORM.examinations-crash-update"

const getTargetExaminations = async buffer => {

    let pipeline = [{
            $match: {
                patientId: {
                    $in: buffer.map(d => d.target.patientId)
                }
            }
        },
        {
            $project: {
                _id: 0
            }
        }
    ]

    console.log(`Load from ${SOURCE} ...`)

    let result = await mongodb.aggregate({
        db,
        collection: SOURCE,
        pipeline
    })

    console.log(`Load from ${SOURCE} ${result.length} items`)

    return result

}


const getSourceExaminations = async buffer => {

    let queries = groupBy(buffer, d => d.source.collection)

    queries = keys(queries).map(key => {

        let form_collection = (queries[key].length > 0) ? queries[key][0].source.form_collection : ""
        form_collection = (form_collection) ? last(form_collection.split(".")) : ""

        return {
            collection: key,
            pipeline: [

                {
                    $match: {
                        "patientId": {
                            $in: queries[key].map(d => d.source.patientId)
                        }
                    }
                },

                {
                    $lookup: {
                        from: form_collection || "dummy",
                        localField: "id",
                        foreignField: "examinationId",
                        as: "af",
                        pipeline: [{
                            $project: {
                                _id: 0,
                                type: 1,
                                data: "$data.en",
                            },
                        }, ],
                    },
                },
                {
                    $project: {
                        forms: 0
                    }
                },
                {
                    $set: {
                        "forms.patient": {
                            $first: {
                                $filter: {
                                    input: "$af",
                                    as: "item",
                                    cond: {
                                        $eq: ["$$item.type", "patient"],
                                    },
                                },
                            },
                        },
                        "forms.echo": {
                            $first: {
                                $filter: {
                                    input: "$af",
                                    as: "item",
                                    cond: {
                                        $eq: ["$$item.type", "echo"],
                                    },
                                },
                            },
                        },
                        "forms.ekg": {
                            $first: {
                                $filter: {
                                    input: "$af",
                                    as: "item",
                                    cond: {
                                        $eq: ["$$item.type", "ekg"],
                                    },
                                },
                            },
                        },
                        "forms.attachements": {
                            $first: {
                                $filter: {
                                    input: "$af",
                                    as: "item",
                                    cond: {
                                        $eq: [
                                            "$$item.type",
                                            "attachements",
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },

                {
                    $set: {
                        "forms.echo.data.reliability": {
                            $first: {
                                $filter: {
                                    input: "$forms.echo.data.reliability",
                                    as: "r",
                                    cond: {
                                        $eq: ["$$r.finalized", true],
                                    },
                                },
                            },
                        },
                        "forms.ekg.data.reliability": {
                            $first: {
                                $filter: {
                                    input: "$forms.ekg.data.reliability",
                                    as: "r",
                                    cond: {
                                        $eq: ["$$r.finalized", true],
                                    },
                                },
                            },
                        },
                        "forms.patient.data.reliability": {
                            $first: {
                                $filter: {
                                    input: "$forms.patient.data.reliability",
                                    as: "r",
                                    cond: {
                                        $eq: ["$$r.finalized", true],
                                    },
                                },
                            },
                        },
                        "forms.patient.data.diagnosisReliability": {
                            $first: {
                                $filter: {
                                    input: "$forms.patient.data.reliability",
                                    as: "r",
                                    cond: {
                                        $eq: ["$$r.finalized", true],
                                    },
                                },
                            },
                        },
                    },
                }


            ]
        }
    })


    let result = await Promise.all(queries.map(query =>
        (async () => {

            console.log(`Load from ${query.collection} ...`)

            let part = await mongodb.aggregate({
                db,
                collection: query.collection,
                pipeline: query.pipeline
            })

            console.log(`Load from ${query.collection} ${part.length} items`)

            return part

        })()
    ))

    return flatten(result)

}

const resolveBuffer = async buffer => {

    let [targetExaminations, sourceExaminations] = await Promise.all([
        getTargetExaminations(buffer),
        getSourceExaminations(buffer)
    ])

    buffer = buffer.map(b => {
        try {
        b.sourceData = find(sourceExaminations, d => b.source.patientId == d.patientId)
        b.targetData = find(targetExaminations, d => b.target.id == d.id)
        b.updateData = b.targetData
        b.updateData.forms = b.targetData.forms
        return b
        } catch(e) {
            console.log("ERROR", JSON.stringify(b, null, " "))
            throw e
        }
    })

    console.log(`Targets: ${buffer.length}, Updates: ${buffer.length}`)

    let updCommands = buffer.map(b => ({
        updateOne: {
            filter: { id: b.id },
            update: {
                $set: {
                    "target.update": UPDATE_ID
                }
            },

            upsert: true
        }
    }))

    await Promise.all([

        (async () => {

            console.log(`Save data for update ${UPDATE_ID} for ${buffer.length} items in ${TARGET} ...`)

            await mongodb.insertAll({
                db,
                collection: TARGET,
                data: buffer.map(d => d.updateData)
            })

            console.log(`Save data for update ${UPDATE_ID} for ${buffer.length} items in ${TARGET} - DONE`)


        })(),

        (async () => {

            if (updCommands.length > 0) {
                console.log(`Set update status ${UPDATE_ID} for ${updCommands.length} items in ${CROSS}`)
                await mongodb.bulkWrite({
                    db,
                    collection: CROSS,
                    commands: updCommands
                })
                console.log(`Set update status ${UPDATE_ID} - DONE`)
            }

        })()
    ])

}

const execute = async () => {



    console.log(`SYNC CRASH EXAMINATIONS ${UPDATE_ID}`)

    console.log(`DROP ${TARGET} ...`)

    await mongodb.drop({
        db,
        collection: TARGET
    })

    console.log(`DROP ${TARGET} - DONE`)


    const PAGE_SIZE = 1000
    let skip = 0
    let bufferCount = 0

    do {

        const pipeline = [{
                '$match': {
                    "target.update": {
                        $ne: UPDATE_ID
                    }
                }
            },
            {
                '$limit': PAGE_SIZE
            },
            {
                $project: {
                    _id: 0
                }
            }
        ]

        console.log(`ADE-TRANSFORM: ${CROSS} > Read buffer ${bufferCount} started at ${skip} ...`)

        buffer = await mongodb.aggregate({
            db,
            collection: CROSS,
            pipeline
        })

        if (buffer.length > 0) {

            console.log(`ADE-TRANSFORM: ${CROSS} > Read buffer ${bufferCount} started at ${skip}: ${buffer.length} items`)
            let commands = []

            await resolveBuffer(buffer)

        }

        skip += buffer.length
        bufferCount++

    } while (buffer.length > 0 ) // && bufferCount < 1)

    console.log(`SYNC CRASH EXAMINATIONS ${UPDATE_ID} DONE`)

}

module.exports = execute