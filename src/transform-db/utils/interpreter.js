const yargs = require("yargs");
const mongodb = require("../../utils/mongodb")
const fs = require("fs")
const { parser } = require('stream-json/jsonl/Parser')
const path = require("path")
const { remove, values, groupBy, flatten, keys } = require("lodash")
const uuid = require("uuid").v4

const db = require("../../../.config-migrate-db").mongodb.ade


const DATA_BUFFER = []


const schema = {
    digiscope: "digiscope",
    poltava: "poltava-part-1",
    strazhesko: "strazhesko-part-1",
    $HHA: "hha",
    hh1: "harvest1",
    denis: "denis-part-1",
    potashev: "potashev-part-1",
    phonendo: "phonendo",
    yoda: "yoda",


    test: "DEV-CLINIC-TEST"
}



const clone = d => JSON.parse(JSON.stringify(d))

const removeItems = (array, count = 0, test = (() => true)) => remove(array, (d, index) => ((count) ? index < count : true) && test(d))

const cardioSpot = d => [
    'Apex',
    'Tricuspid',
    'Pulmonic',
    'Aortic',
    'Right Carotid',
    'Erb\'s',
    'Erb\'s Right',
    'Left Carotid'
].includes(d["Body Spot"])


const exchange_H_2_H = ({ p1, p2 }) => { // tested

    console.log(`${p1.examination.patientId} > ${p2.examination.patientId} store: no stored, labels: exchange all, forms: exchange`)

    let r1 = clone(p1)
    let r2 = clone(p2)

    let labels = removeItems(r1.labels)
    r1.labels = removeItems(r2.labels)
    r2.labels = labels

    r1.labels = r1.labels.map(l => {
        l["Examination ID"] = r1.examination.patientId
        return l
    })

    r2.labels = r2.labels.map(l => {
        l["Examination ID"] = r2.examination.patientId
        return l
    })


    let forms = clone(r1.examination.forms)
    r1.examination.forms = clone(r2.examination.forms)
    r2.examination.forms = forms

    delete r1.$records

    return {
        p1: r1,
        p2: r2,
        store: []
    }

}

// const exchange_H1_2_H2 = ({ p1, p2 }) => {

//     let h1r = clone(p1)
//     let h2r = clone(p2)

//     h1r.labels = h1r.labels.filter(l => p1.$records.includes(l.path))

//     let h1Labels = removeItems(h1r.labels)
//     let h2Labels = removeItems(h2r.labels, h1Labels.length)

//     h1Labels = h1Labels.map((l, index) => {
//         l["Examination ID"] = h2r.examination.patientId

//         let buf = h2Labels[index].model
//         h2Labels[index].model = l.model
//         l.model = buf

//         buf = clone(h2Labels[index].deviceDescription || {})
//         h2Labels[index].deviceDescription = clone(l.deviceDescription || {})
//         l.deviceDescription = buf

//         return l

//     })


//     h2Labels = h2Labels.map(l => {
//         l["Examination ID"] = h1r.examination.patientId
//         return l
//     })

//     h1r.labels = h2Labels
//     h2r.labels = h1Labels

//     delete h1r.$records

//     return {
//         p1: h1r,
//         p2: h2r
//     }

// }

const exchange_Y_2_H = ({ p1, p2 }) => { // tested

    console.log(`${p1.examination.patientId} > ${p2.examination.patientId} store: all stored, labels: exchange selected, forms: no exchange`)


    let yr = clone(p1)
    let hr = clone(p2)


    yr.labels = yr.labels.filter(l => p1.$records.includes(l.path))
    let yLabels = removeItems(yr.labels)
    let hLabels = removeItems(hr.labels, yLabels.length)

    yLabels = yLabels.map((l, index) => {
        l["Examination ID"] = hr.examination.patientId
        let buf = hLabels[index].model
        hLabels[index].model = l.model
        l.model = buf

        buf = clone(hLabels[index].deviceDescription || {})
        hLabels[index].deviceDescription = clone(l.deviceDescription || {})
        l.deviceDescription = buf

        return l

    })


    hLabels = hLabels.map(l => {
        l["Examination ID"] = yr.examination.patientId
        return l
    })

    yr.labels = hLabels
    hr.labels = yLabels

    delete yr.$records

    return {
        p1: yr,
        p2: hr,
        store: [p1, p2]
    }
}


const exchange_H_2_Y = ({ p1, p2 }) => { // tested

    console.log(`${p1.examination.patientId} > ${p2.examination.patientId} store: all stored, labels: exchange all, forms: all clear`)

    let hr = clone(p1)
    let yr = clone(p2)

    let hLabels = clone(hr.labels)
    let yLabels = clone(yr.labels)

    hLabels = hLabels.map((l, index) => {
        l["Examination ID"] = yr.examination.patientId
        l.model = "unknown"
        l.deviceDescription = {}
        return l

    })


    yLabels = yLabels.map(l => {
        l["Examination ID"] = hr.examination.patientId
        l.model = "unknown"
        l.deviceDescription = {}
        return l
    })

    yr.labels = hLabels
    hr.labels = yLabels

    yr.examination.forms = {
        patient: { type: "patient", data: {} },
        echo: { type: "patient", data: {} },
        ekg: { type: "patient", data: {} },
        attachenents: { type: "patient", data: [] },
    }

    hr.examination.forms = {
        patient: { type: "patient", data: {} },
        echo: { type: "patient", data: {} },
        ekg: { type: "patient", data: {} },
        attachenents: { type: "patient", data: [] },
    }


    delete hr.$records

    return {
        p1: hr,
        p2: yr,
        store: [p1, p2]
    }
}


const exchange_D_2_Y = ({ p1, p2 }) => { // tested

    console.log(`${p1.examination.patientId} > ${p2.examination.patientId} store: all stored, labels: exchange all set digiscope device, forms: all clear`)

    let hr = clone(p1)
    let yr = clone(p2)

    let hLabels = clone(hr.labels)
    let yLabels = clone(yr.labels)

    hLabels = hLabels.map((l, index) => {
        l["Examination ID"] = yr.examination.patientId

        l.model = "unknown"

        l.deviceDescription = {}
        return l

    })


    yLabels = yLabels.map(l => {
        l["Examination ID"] = hr.examination.patientId
        l.model = "digiscope"
        l.deviceDescription = {}
        return l
    })

    yr.labels = hLabels
    hr.labels = yLabels

    yr.examination.forms = {
        patient: { type: "patient", data: {} },
        echo: { type: "patient", data: {} },
        ekg: { type: "patient", data: {} },
        attachenents: { type: "patient", data: [] },
    }

    hr.examination.forms = {
        patient: { type: "patient", data: {} },
        echo: { type: "patient", data: {} },
        ekg: { type: "patient", data: {} },
        attachenents: { type: "patient", data: [] },
    }


    delete hr.$records

    return {
        p1: hr,
        p2: yr,
        store: [p1, p2]
    }
}






const exchange = {

    "yoda_strazhesko": exchange_Y_2_H,
    "hh1_strazhesko": exchange_H_2_H,
    "potashev_poltava": exchange_H_2_H,
    "potashev_strazhesko": exchange_H_2_H,
    "denis_strazhesko": exchange_H_2_H,
    "phonendo_strazhesko": exchange_Y_2_H,
    "$HHA_strazhesko": exchange_Y_2_H,
    "strazhesko_potashev": exchange_H_2_H,
    "strazhesko_denis": exchange_H_2_H,
    "strazhesko_hh1": exchange_H_2_H,
    "digiscope_yoda": exchange_D_2_Y,
    "strazhesko_yoda": exchange_H_2_Y,

    "test_test": exchange_Y_2_H,

}


const loadData = async patient => find( DATA_BUFFER, d.patientId == patient.patientId)

// {

//     let examination = await mongodb.aggregate({
//         db,
//         collection: `${patient.schema}.examinations`,
//         pipeline: [{
//                 $match: {
//                     patientId: patient.patientId
//                 }
//             },
//             {
//                 $project: {
//                     _id: 0
//                 }
//             }
//         ]
//     })
//     examination = examination[0]

//     let labels = await mongodb.aggregate({
//         db,
//         collection: `${patient.schema}.labels`,
//         pipeline: [{
//                 $match: {
//                     "Examination ID": patient.patientId
//                     // patientId: patient.patientId
//                 }
//             },
//             {
//                 $project: {
//                     _id: 0
//                 }
//             }
//         ]
//     })

//     return {
//         schema: patient.schema,
//         examination,
//         labels,
//         $records: patient.records
//     }

// }



const stat = p => {
    console.log(p.examination.patientId)
    console.log(p.labels
        .filter(l => (p.$records) ? p.$records.includes(l.path) : true)
        .map(l => `${l.id}:${l["Examination ID"]}:${l.model}`)
    )
}


const executeExchange = async command => {
    command.data = command.data.map(d => {
        d.schema = schema[d.site]
        return d
    })

    let p1 = await loadData(command.data[0])
    let p2 = await loadData(command.data[1])

    // stat(p1)
    // stat(p2)
    // console.log("--------------")

    let change = exchange[`${command.data[0].site}_${command.data[1].site}`]({ p1, p2 })

    // stat(change.p1)
    // stat(change.p2)
    // console.log("--------------")

    return {
        remove: [p1, p2],
        insert: [change.p1, change.p2],
        store: change.store
    }

}




const executeSplit = async command => {

    command.schema = schema[command.site]

    let loadedPatient = await loadData(command)

    let sourcePatient = clone(loadedPatient)

    let splittedRecordsCount = Math.floor(sourcePatient.labels.length / command.data.length)

    let patients = command.data.map(d => {
        let examination = clone(sourcePatient.examination)
        examination.patientId = d.patientId,
            examination.uuid = uuid()
        let labels = (sourcePatient.labels.length > splittedRecordsCount) ?
            remove(sourcePatient.labels, (d, index) => index < splittedRecordsCount) :
            remove(sourcePatient.labels, () => true)
        labels = labels.map(l => {
            l["Examination ID"] = d.patientId
            return l
        })

        return {
            examination,
            labels
        }
    })


    stat(sourcePatient)
    patients.forEach(p => {
        stat(p)
    })

    return {
        remove: sourcePatient,
        insert: patients,
        store: [loadedPatient]
    }


}


const updateDb = async command => {

    //////////////////////////////////////////////////////////////////////////////////////////
    // 1. store
    if (command.store.length > 0) {

        console.log(`STORE DATA: ${command.store.length} items`)

        for (const p of command.store) {

            let examination = p.examination
            examination.schema = p.schema
            console.log(`insert into ADE-TRANSFORM.examinations ${examination.patientId}`)
            // await mongodb.insertOneIfNotExists({
            //         db,
            //         collection: `ADE-TRANSFORM.examinations`,
            //         filter: {
            //             id: examination.id
            //         },
            //         data: examination
            //     }),

            //     let labels = p.labels.map(l => {
            //         l.schema = p.schema
            //     })

            console.log(`insert into ADE-TRANSFORM.labels  ${p.labels.length} items`) //${labels.map( l => l.id ).join(",\n")}`)

            // await mongodb.insertManyIfNotExists({
            //         db,
            //         collection: `ADE-TRANSFORM.labels`,
            //         filter: l => ({ id: l.id }),
            //         data: labels
            //     }),

        }

    }

    //////////////////////////////////////////////////////////////////////////////////////////
    // 2. remove
    if (command.remove.length > 0) {

        console.log(`REMOVE DATA: ${command.remove.length} items`)

        for (let p of command.remove) {

            console.log(`remove from ${p.schema}.examinations ${p.examination.patientId}`)

            // await mongodb.deleteOne({
            //     db,
            //     collection: `${p.schema}.examinations`,
            //     filter: { id: p.examination.id }
            // })

            console.log(`remove from ${p.schema}.labels ${p.labels.length} items`) //${p.labels.map( l => l.id ).join(",\n")}`)

            // await mongodb.deleteMany({
            //     db,
            //     collection: `${p.schema}.labels`,
            //     filter: { id: { $in: p.labels.map(l => l.id) } }
            // })

        }

    }

    //////////////////////////////////////////////////////////////////////////////////////////
    // 3. insert

    if (command.insert.length > 0) {

        console.log(`INSERT DATA: ${command.insert.length} items`)

        for (let p of command.insert) {

            console.log(`insert into ${p.schema}.examinations ${p.examination.patientId}`)

            // await mongodb.insertOne({
            //     db,
            //     collection: `${p.schema}.examinations`,
            //     filter: { id: p.examination.id },
            //     data: p.examination
            // })

            console.log(`insert into ${p.schema}.labels  ${p.labels.length} items`) //${p.labels.map( l => l.id ).join(",\n")}`)

            // await mongodb.insertMany({
            //     db,
            //     collection: `${p.schema}.labels`,
            //     data: p.labels
            // })

        }

    }
}


const loadDataBufferPart = async (schema, patients) => {
    let pipeline = [{
            $match: {
                patientId: {
                    $in: patients.map( p => p.patientId),
                },
            },
        },
        {
            $lookup: {
                from: "labels",
                localField: "patientId",
                foreignField: "Examination ID",
                as: "labels",
                pipeline: [{
                        $match: {
                            "Examination ID": {
                                $in: patients.map( p => p.patientId),
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                        },
                    },
                ],
            },
        },
    ]

    let res = await mongodb.aggregate({
        db,
        collection: `${schema}.examinations`,
        pipeline
    })

    res => res.map( d => {
        let examination = clone(d)
        let labels = clone(d.labels)
        delete examination.labels
        let patient = find(patients, p => p.patientId == examination.patientId)
        return {
            schema,
            examination,
            labels,
            $records: patient.records
        }
    })

    return res
}


const loadDataBuffer = async script => {
    
    DATA_BUFFER = []

    let patients = groupBy(
        flatten(
            script.map(s => {
                if (s.command == "exchange") return s.data.map(d => {
                    d.schema = schema[d.site]
                })
                if (s.command == "split") return {
                    "patientId": s.patientId,
                    "dataset": s.dataset,
                    "site": s.site,
                    schema: schema[s.site]
                }
                return []
            })
        ),
        d => d.schema
    )

    let schemas = keys(patients)

    for (const schema of schemas) {
        let part = await loadDataBufferPart(schema, patients[schema])
        console.log(`LOAD DATA BUFFER from ${schema}: ${part.length} items`)
        DATA_BUFFER = DATA_BUFFER.concat(part)
    }


}


const executePart = async script => {

    await loadDataBuffer()

    for (let command of script) {

        console.log(`${command.index}: ${command.command}`)

        try {

            let result

            if (command.command == "exchange") {
                result = await executeExchange(command)
            }

            if (command.command == "split") {
                result = await executeSplit(command)
            }

            if (result) {
                await updateDb(result)
            }

            command.done = true

        } catch (e) {

            console.log(command, e.toString(), e.stack)
            command.error = `${e.toString()} ${e.stack}`
            break
        }

    }

    return script

}



const execute = async () => {

    const PAGE_SIZE = 10

    let skip = 0
    let bufferCount = 0

    hasError = false

    do {

        const pipeline = [{
                '$match': {
                    done: {
                        $exists: false
                    },
                    error: {
                        $exists: false
                    }
                }
            },
            {
                $sort: {
                    index: 1
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

        buffer = await mongodb.aggregate({
            db,
            collection: `ADE-TRANSFORM.commands`,
            pipeline
        })

        if (buffer.length > 0) {

            console.log(`${new Date()} -------------------------> Read buffer ${bufferCount} started at ${skip}: ${buffer.length} items`)


            if (buffer.length > 0) {

                let script = await executePart(buffer)
                hasError = script.map(s => s.error).filter(d => d).length > 0

                await mongodb.updateMany({
                    db,
                    collection: `ADE-TRANSFORM.commands`,
                    filter: {
                        index: {
                            $in: script.filter(s => s.done).map(s => s.index)
                        }
                    },
                    data: {
                        done: true
                    }

                })

                let commands = script.filter(s => s.done || s.error).map(s => ({
                    updateOne: {
                        filter: { index: s.index },
                        update: {
                            $set: {
                                done: s.done,
                                error: s.error
                            }
                        }
                    }
                }))

                await mongodb.bulkWrite({
                    db,
                    collection: `ADE-TRANSFORM.commands`,
                    commands
                })

                // TODO use bulkWrite for update script commands state


            }

            skip += buffer.length
            bufferCount++

        }
    }
    while (buffer.length > 0 && !hasError)

}


module.exports = execute