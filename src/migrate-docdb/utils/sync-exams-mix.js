const docdb = require("../../utils/docdb")("ADE")
const mongodb = require("../../utils/mongodb")
const db = require("../../../.config-migrate-db").mongodb.ade
const { find, groupBy, keys, first, last, isUndefined, flatten } = require("lodash")
const Diff = require("./diff")
const uuid = require("uuid").v4

const sanitizePipeline = require("./sanitize-pipelines")

const UPDATE_ID = uuid()

const CROSS = "ADE-TRANSFORM.external-examinations"
const UPDATES = "ADE-TRANSFORM.update-log-examinations"

const testChanges = delta => {
    return keys(delta).map(key => !isUndefined(delta[key])).reduce((a, b) => a || b, false)
}

const detectChanges = async buffer => {

    let result = []

    for (const b of buffer) {

        b.delta = await Diff.delta(
            b.targetData,
            b.sourceData,
            "forms.echo",
            "forms.ekg",
            "forms.patient"
        )

        if (testChanges(b.delta)) result.push(b)
    }

    return result
}

const getTargetExaminations = async (buffer, SCHEMA) => {

    let pipeline = [{
        $match: {
            id: {
                $in: buffer.map(d => d.target.id)
            }
        }
    }]

    console.log(`Load from ${SCHEMA}.examinations ...`)

    let result = await docdb.aggregate({
        collection: `${SCHEMA}.examinations`,
        pipeline
    })

    console.log(`Load from ${SCHEMA}.examinations ${result.length} items`)

    return result

}


const getSourceExaminations = async buffer => {

    let queries = groupBy(buffer, d => d.source.collection)

    queries = keys(queries).map(key => {

        let form_collection = (queries[key].length > 0) ? queries[key][0].source.form_collection : ""
        form_collection = (form_collection) ? last(form_collection.split(".")) : ""

        return {
            collection: key,
            pipeline:  
            [{
                    $match: {
                        "patientId": {
                            $in: queries[key].map(d => d.source.patientId)
                        }
                    }
                },
            ].concat(sanitizePipeline( {form_collection} ).examinations)
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

const resolveBuffer = async (buffer, SCHEMA) => {

    let [targetExaminations, sourceExaminations] = await Promise.all([
        getTargetExaminations(buffer, SCHEMA),
        getSourceExaminations(buffer)
    ])

    buffer = buffer.map(b => {
        b.sourceData = find(sourceExaminations, d => b.source.patientId == d.patientId)
        b.targetData = find(targetExaminations, d => b.target.id == d.id)
        return b
    })

    // console.log(buffer)

    let updates = await detectChanges(buffer)
    updates = updates.filter(d => d.sourceData && d.sourceData.forms)

    // console.log(JSON.stringify(updates, null, " "))

    console.log(`Targets: ${buffer.length}, Updates: ${updates.length}`)

    console.log(updates.map( d => `${d.target.id}: ${JSON.stringify(d.delta)}`))

    let commands = updates.map(b => ({
        updateOne: {
            filter: { id: b.target.id },
            update: {
                $set: {
                    forms: b.sourceData.forms
                }    
            },
            upsert: true
        }

    }))

    console.log(commands)

    updCommands = buffer.map(b => ({
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

            if (commands.length > 0) {

                console.log(`Update ${commands.length} items in ${SCHEMA}.examinations`)

                await docdb.bulkWrite({
                    collection: `${SCHEMA}.examinations`,
                    commands
                })

                console.log(`Update ${commands.length} items in ${SCHEMA}.examinations - DONE`)

            }

        })(),

        (async () => {

            if (commands.length > 0) {
                console.log(`Save info for update ${UPDATE_ID} for ${updCommands.length} items in ${UPDATES}`)
                await mongodb.insertAll({
                    db,
                    collection: UPDATES,
                    data: [{
                        id: UPDATE_ID,
                        date: new Date(),
                        collection: `${SCHEMA}.labels`,
                        commands: JSON.stringify(commands),
                        delta: updates
                    }]
                })
                console.log(`Save update info for update ${UPDATE_ID} - DONE`)
            }

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

const execute = async SCHEMA => {



    console.log(`SYNC EXAMINATIONS FOR ${SCHEMA} ${UPDATE_ID}`)

    const PAGE_SIZE = 1000
    let skip = 0
    let bufferCount = 0

    do {

        const pipeline = [{
                '$match': {
                    "target.schema": SCHEMA,
                    crashed: {
                        $exists: false
                    },
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

        console.log(`ADE-TRANSFORM: ${SCHEMA} > Read buffer ${bufferCount} started at ${skip} ...`)

        buffer = await mongodb.aggregate({
            db,
            collection: CROSS,
            pipeline
        })

        if (buffer.length > 0) {

            console.log(`ADE-TRANSFORM: ${SCHEMA} > Read buffer ${bufferCount} started at ${skip}: ${buffer.length} items`)
            let commands = []

            await resolveBuffer(buffer, SCHEMA)

        }

        skip += buffer.length
        bufferCount++

    } while (buffer.length > 0 ) // && bufferCount < 1)

    console.log(`SYNC EXAMINATIONS FOR ${SCHEMA} ${UPDATE_ID} DONE`)

}

module.exports = execute