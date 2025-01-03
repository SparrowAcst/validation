const yargs = require("yargs");
const mongodb = require("../../utils/mongodb")
const fs = require("fs")
const { parser } = require('stream-json/jsonl/Parser')
const path = require("path")
const { remove, values, groupBy, flatten, keys, find, fill, uniqBy, sample } = require("lodash")
const uuid = require("uuid").v4

const db = require("../../../.config-migrate-db").mongodb.ade


let DATA_BUFFER = []


const splitToParts = (volume, parts) => {

    if (volume < parts) return []
    else if (volume % parts == 0) {
        return fill(Array(parts), Math.round(volume / parts));
    } else {

        // upto n-(x % n) the values 
        // will be x / n 
        // after that the values 
        // will be x / n + 1
        let zp = parts - (volume % parts);
        let pp = Math.floor(volume / parts);
        let res = []
        for (let i = 0; i < parts; i++) res.push(((i >= zp) ? Math.round(pp + 1) : Math.round(pp)))
        return res

    }
}



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

    // console.log(`H_2_H ${p1.examination.patientId} > ${p2.examination.patientId} store: no stored, labels: exchange all, forms: exchange`)

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

    r1.examination.trace = r1.examination.trace || [{
        proc: "START",
        patientId: r1.examination.patientId
    }]

    r2.examination.trace = r2.examination.trace || [{
        proc: "START",
        patientId: r2.examination.patientId
    }]

    r1.examination.trace.push({
        proc: "H2H",
        patientId: r2.examination.patientId
    })
    r2.examination.trace.push({
        proc: "H2H",
        patientId: r1.examination.patientId
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


const swap = (value, pool, index, field, defaultValue) => {
    let buf = (pool[index]) ? (pool[index][field] || defaultValue) : defaultValue
    if (pool[index]) {
        pool[index][field] = value
    }
    return buf
}


const exchange_Y_2_H = ({ p1, p2 }) => { // tested

    // console.log(`Y_2_H ${p1.examination.patientId} > ${p2.examination.patientId} store: all stored, labels: exchange selected, forms: no exchange`)


    let yr = clone(p1)
    let hr = clone(p2)

    yr.examination.crashed = true
    hr.examination.crashed = true

    let yLabels = clone(yr.labels)
    let hLabels = clone(hr.labels)

    if (hLabels.length > yLabels.length) {
        hLabels = removeItems(hLabels, yLabels.length)
    }

    yr.examination.trace = yr.examination.trace || [{
        proc: "START",
        patientId: yr.examination.patientId
    }]

    hr.examination.trace = hr.examination.trace || [{
        proc: "START",
        patientId: hr.examination.patientId
    }]

    yr.examination.trace.push({
        proc: "Y2H",
        crashed: true,
        patientId: hr.examination.patientId
    })
    hr.examination.trace.push({
        proc: "Y2H",
        crashed: true,
        patientId: yr.examination.patientId
    })



    let models = uniqBy(yLabels.map(d => d.model))
    // console.log("models YH", models.join(","))

    yLabels.forEach(l => {
        l["Examination ID"] = hr.examination.patientId
        l.deviceDescription = {}
    })

    hLabels.forEach(l => {
        l["Examination ID"] = yr.examination.patientId
        l.deviceDescription = {}
        l.model = sample(models) //models[Math.trunc(Math.random()*models.length)]
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

    delete yr.$records

    return {
        p1: yr,
        p2: hr,
        store: [p1, p2]
    }
}

const exchange_P_2_H = ({ p1, p2 }) => { // tested

    // console.log(`P_2_H ${p1.examination.patientId} > ${p2.examination.patientId} store: all stored, labels: exchange selected, forms: no exchange`)


    let pr = clone(p1)
    let hr = clone(p2)

    pr.examination.crashed = true
    hr.examination.crashed = true


    let pLabels = clone(pr.labels)
    let hLabels = clone(hr.labels)
    hLabels = removeItems(hLabels, pLabels.length)


    pr.examination.trace = pr.examination.trace || [{
        proc: "START",
        patientId: pr.examination.patientId
    }]

    hr.examination.trace = hr.examination.trace || [{
        proc: "START",
        patientId: hr.examination.patientId
    }]

    pr.examination.trace.push({
        proc: "P2H",
        crashed: true,
        patientId: hr.examination.patientId
    })

    hr.examination.trace.push({
        proc: "P2H",
        crashed: true,
        patientId: pr.examination.patientId
    })

    // let models = uniqBy(hLabels.map(d => d.model))

    // console.log("models PH", models.join(","))

    pLabels.forEach(l => {
        l["Examination ID"] = hr.examination.patientId
        // l.model = sample(models) //models[Math.round(Math.random()*models.length)]
        // l.deviceDescription = {}
    })

    hLabels.forEach(l => {
        l["Examination ID"] = pr.examination.patientId
        // l.model = "Phonendo"
        // l.deviceDescription = {}
    })

    pr.labels = hLabels
    hr.labels = pLabels

    pr.examination.forms = {
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

    delete pr.$records

    return {
        p1: pr,
        p2: hr,
        store: [p1, p2]
    }
}

const exchange_H_2_Y = ({ p1, p2 }) => { // tested

    // console.log(`H_2_Y ${p1.examination.patientId} > ${p2.examination.patientId} store: all stored, labels: exchange all, forms: all clear`)

    let hr = clone(p1)
    let yr = clone(p2)

    yr.examination.crashed = true
    hr.examination.crashed = true


    let hLabels = clone(hr.labels)
    hLabels = remove(hLabels, l => hr.$records.includes(l.path))
    
    let yLabels = clone(yr.labels)

    yr.examination.trace = yr.examination.trace || [{
        proc: "START",
        patientId: yr.examination.patientId
    }]

    hr.examination.trace = hr.examination.trace || [{
        proc: "START",
        patientId: hr.examination.patientId
    }]

    yr.examination.trace.push({
        proc: "H2Y",
        crashed: true,
        patientId: hr.examination.patientId
    })

    hr.examination.trace.push({
        proc: "H2Y",
        crashed: true,
        patientId: yr.examination.patientId
    })


    yModels = uniqBy(yLabels.map(d => d.model))
    hModels = uniqBy(hLabels.map(d => d.model))

    // console.log("models H", hModels.join(","))
    // console.log("models Y", yModels.join(","))


    hLabels = hLabels.map((l, index) => {
        l["Examination ID"] = yr.examination.patientId
        l.model = sample(yModels) //yModels[Math.round(Math.random()*yModels.length)]
        l.deviceDescription = {}
        return l

    })


    yLabels = yLabels.map(l => {
        l["Examination ID"] = hr.examination.patientId
        l.model = sample(hModels) //hModels[Math.round(Math.random()*hModels.length)]
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


const exchange_H_2_P = ({ p1, p2 }) => { // tested

    // console.log(`H_2_Y ${p1.examination.patientId} > ${p2.examination.patientId} store: all stored, labels: exchange all, forms: all clear`)

    let hr = clone(p1)
    let yr = clone(p2)

    yr.examination.crashed = true
    hr.examination.crashed = true

    let hLabels = clone(hr.labels)
    hLabels = remove(hLabels, l => hr.$records.includes(l.path))
    
    let yLabels = clone(yr.labels)
    
    yr.examination.trace = yr.examination.trace || [{
        proc: "START",
        patientId: yr.examination.patientId
    }]

    hr.examination.trace = hr.examination.trace || [{
        proc: "START",
        patientId: hr.examination.patientId
    }]

    yr.examination.trace.push({
        proc: "H2P",
        crashed: true,
        patientId: hr.examination.patientId
    })

    hr.examination.trace.push({
        proc: "H2P",
        crashed: true,
        patientId: yr.examination.patientId
    })

    yModels = uniqBy(yLabels.map(d => d.model))
    hModels = uniqBy(hLabels.map(d => d.model))

    // console.log("models H", hModels.join(","))
    // console.log("models Y", yModels.join(","))


    hLabels = hLabels.map((l, index) => {
        l["Examination ID"] = yr.examination.patientId
        l.model = sample(yModels) //yModels[Math.round(Math.random()*yModels.length)]
        l.deviceDescription = {}
        return l

    })


    yLabels = yLabels.map(l => {
        l["Examination ID"] = hr.examination.patientId
        l.model = sample(hModels) //hModels[Math.round(Math.random()*hModels.length)]
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

    // console.log(`D_2_Y ${p1.examination.patientId} > ${p2.examination.patientId} store: all stored, labels: exchange all set digiscope device, forms: all clear`)

    let dr = clone(p1)
    let yr = clone(p2)

    dr.examination.crashed = true
    yr.examination.crashed = true


    let dLabels = clone(dr.labels)
    let yLabels = clone(yr.labels)


    yr.examination.trace = yr.examination.trace || [{
        proc: "START",
        patientId: yr.examination.patientId
    }]

    dr.examination.trace = dr.examination.trace || [{
        proc: "START",
        patientId: dr.examination.patientId
    }]

    yr.examination.trace.push({
        proc: "D2Y",
        crashed: true,
        patientId: dr.examination.patientId
    })

    dr.examination.trace.push({
        proc: "D2Y",
        crashed: true,
        patientId: yr.examination.patientId
    })


    dLabels = dLabels.map((l, index) => {
        l["Examination ID"] = yr.examination.patientId

        l.model = "unknown"

        l.deviceDescription = {}
        return l

    })


    yLabels = yLabels.map(l => {
        l["Examination ID"] = dr.examination.patientId
        l.model = "DigiScope"
        l.deviceDescription = {}
        return l
    })

    yr.labels = dLabels
    dr.labels = yLabels

    yr.examination.forms = {
        patient: { type: "patient", data: {} },
        echo: { type: "patient", data: {} },
        ekg: { type: "patient", data: {} },
        attachenents: { type: "patient", data: [] },
    }

    dr.examination.forms = {
        patient: { type: "patient", data: {} },
        echo: { type: "patient", data: {} },
        ekg: { type: "patient", data: {} },
        attachenents: { type: "patient", data: [] },
    }


    delete dr.$records

    return {
        p1: dr,
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
    "phonendo_strazhesko": exchange_P_2_H,
    "$HHA_strazhesko": exchange_Y_2_H,
    "strazhesko_potashev": exchange_H_2_H,
    "strazhesko_denis": exchange_H_2_H,
    "strazhesko_hh1": exchange_H_2_H,
    "digiscope_yoda": exchange_D_2_Y,
    "strazhesko_yoda": exchange_H_2_Y,
    "strazhesko_phonendo": exchange_H_2_P,
    
    "test_test": exchange_Y_2_H,

}


const getData = patient => {
    let res = find(DATA_BUFFER, d => d.examination.patientId == patient.patientId)
    if (!res) {
        throw new Error(`Patient ${patient.patientId} not found in data buffer`)
    } else {
        return res
    }
}


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

    let p1 = getData(command.data[0])
    let p2 = getData(command.data[1])

    // console.log(command.data[0], p1)

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

    let loadedPatient = getData(command)

    let sourcePatient = clone(loadedPatient)

    sourcePatient.examination.trace = sourcePatient.examination.trace || [{
        proc: "START",
        patientId: sourcePatient.examination.patientId
    }]

    let partitions = splitToParts(loadedPatient.labels.length, command.data.length)

    let patients = command.data.map((d, index) => {

        let examination = clone(sourcePatient.examination)

        examination.patientId = d.patientId
        examination.uuid = uuid()
        examination.id = examination.uuid
        examination.trace.push({
            proc: "SPLIT",
            crashed: true,
            patientId: d.patientId
        })

        let labels = removeItems(sourcePatient.labels, partitions[index])

        labels = labels.map(l => {
            l["Examination ID"] = d.patientId
            return l
        })

        return {
            schema: loadedPatient.schema,
            examination,
            labels
        }
    })

    // console.log(loadedPatient.examination.patientId, loadedPatient.labels.length, patients.length)

    patients.forEach(p => {
        stat(p)
    })

    return {
        remove: loadedPatient,
        insert: patients,
        store: [loadedPatient]
    }


}

const stub = command => {

    //////////////////////////////////////////////////////////////////////////////////////////
    // 1. store
    if (command.store.length > 0) {

        console.log(`STORE DATA: ${command.store.length} items`)

        let insertedExaminations = command.store.map(s => {
            s.examination.schema = s.schema
            return s.examination
        })

        console.log(`insert into ADE-TRANSFORM.examinations ${insertedExaminations.length}`)
        console.log(insertedExaminations.map(d => `${d.schema}.${d.patientId}`))

        let insertedLabels = flatten(
            command.store.map(s => s.labels.map(l => {
                l.schema = s.schema
                return l
            }))
        )

        console.log(`insert into ADE-TRANSFORM.labels ${insertedLabels.length}`)

    }

    //////////////////////////////////////////////////////////////////////////////////////////
    // 2. remove
    if (command.remove.length > 0) {

        console.log(`REMOVE DATA: ${command.remove.length} items`)

        let removedExaminations = command.remove.map(s => {
            s.examination.schema = s.schema
            return s.examination
        })

        removedExaminations = groupBy(removedExaminations, d => d.schema)

        let schemas = keys(removedExaminations)
        for (let schema of schemas) {
            console.log(`remove from ${schema}-mix.examinations ${removedExaminations[schema].length}`)
            console.log(removedExaminations[schema].map(d => d.patientId))

        }


        let removedLabels = flatten(
            command.remove.map(s => s.labels.map(l => {
                l.schema = s.schema
                return l
            }))
        )

        removedLabels = groupBy(removedLabels, d => d.schema)

        schemas = keys(removedLabels)

        for (let schema of schemas) {
            console.log(`remove from ${schema}-mix.labels ${removedLabels[schema].length}`)
        }

    }

    //////////////////////////////////////////////////////////////////////////////////////////
    // 3. insert

    if (command.insert.length > 0) {

        console.log(`INSERT DATA: ${command.insert.length} items`)

        let updatedExaminations = command.insert.map(s => {
            s.examination.schema = s.schema
            return s.examination
        })

        updatedExaminations = groupBy(updatedExaminations, d => d.schema)

        let schemas = keys(updatedExaminations)
        for (let schema of schemas) {
            console.log(`insert into ${schema}-mix.examinations ${updatedExaminations[schema].length}`)
            console.log(updatedExaminations[schema].map(d => d.patientId))
        }


        let updatedLabels = flatten(
            command.insert.map(s => s.labels.map(l => {
                l.schema = s.schema
                return l
            }))
        )

        updatedLabels = groupBy(updatedLabels, d => d.schema)

        schemas = keys(updatedLabels)
        for (let schema of schemas) {
            console.log(`insert into ${schema}-mix.labels ${updatedLabels[schema].length}`)
        }

    }
}


const updateDb = async command => {

    // stub(command)
    // return

    //////////////////////////////////////////////////////////////////////////////////////////
    // 1. store
    if (command.store.length > 0) {

        command.store = command.store.filter(d => !/-S-/.test(d.examination.patientId))
        console.log(`STORE DATA: ${command.store.length} items`)

        let insertedExaminations = command.store.map(s => {
            s.examination.schema = s.schema
            return s.examination
        })

        console.log(`insert into ADE-TRANSFORM.examinations ${insertedExaminations.length}`)
        console.log(insertedExaminations.map(d => `${d.schema}.${d.patientId}`))

        await mongodb.insertManyIfNotExists({
            db,
            collection: `ADE-TRANSFORM.examinations`,
            filter: d => ({ id: d.id }),
            data: insertedExaminations
        })

        let insertedLabels = flatten(
            command.store.map(s => s.labels.map(l => {
                l.schema = s.schema
                return l
            }))
        )

        console.log(`insert into ADE-TRANSFORM.labels ${insertedLabels.length}`)

        await mongodb.insertManyIfNotExists({
            db,
            collection: `ADE-TRANSFORM.labels`,
            filter: d => ({ id: d.id }),
            data: insertedLabels
        })

    }

    //////////////////////////////////////////////////////////////////////////////////////////
    // 2. remove
    if (command.remove.length > 0) {

        console.log(`REMOVE DATA: ${command.remove.length} items`)

        let removedExaminations = command.remove.map(s => {
            s.examination.schema = s.schema
            return s.examination
        })

        removedExaminations = groupBy(removedExaminations, d => d.schema)

        let schemas = keys(removedExaminations)
        for (let schema of schemas) {
            console.log(`remove from ${schema}-mix.examinations ${removedExaminations[schema].length}`)
            console.log(removedExaminations[schema].map(d => d.patientId))

            await mongodb.deleteMany({
                db,
                collection: `${schema}-mix.examinations`,
                filter: { id: { $in: removedExaminations[schema].map(d => d.id) } }
            })

        }


        let removedLabels = flatten(
            command.remove.map(s => s.labels.map(l => {
                l.schema = s.schema
                return l
            }))
        )

        removedLabels = groupBy(removedLabels, d => d.schema)

        schemas = keys(removedLabels)

        for (let schema of schemas) {
            console.log(`remove from ${schema}-mix.labels ${removedLabels[schema].length}`)
            await mongodb.deleteMany({
                db,
                collection: `${schema}-mix.labels`,
                filter: { id: { $in: removedLabels[schema].map(d => d.id) } }
            })

        }

    }

    //////////////////////////////////////////////////////////////////////////////////////////
    // 3. insert

    if (command.insert.length > 0) {

        console.log(`INSERT DATA: ${command.insert.length} items`)

        let updatedExaminations = command.insert.map(s => {
            s.examination.schema = s.schema
            return s.examination
        })

        updatedExaminations = groupBy(updatedExaminations, d => d.schema)

        let schemas = keys(updatedExaminations)
        for (let schema of schemas) {
            console.log(`insert into ${schema}-mix.examinations ${updatedExaminations[schema].length}`)
            console.log(updatedExaminations[schema].map(d => d.patientId))
            await mongodb.insertMany({
                db,
                collection: `${schema}-mix.examinations`,
                data: updatedExaminations[schema]
            })
        }


        let updatedLabels = flatten(
            command.insert.map(s => s.labels.map(l => {
                l.schema = s.schema
                return l
            }))
        )

        updatedLabels = groupBy(updatedLabels, d => d.schema)

        schemas = keys(updatedLabels)
        for (let schema of schemas) {
            console.log(`insert into ${schema}-mix.labels ${updatedLabels[schema].length}`)
            await mongodb.insertMany({
                db,
                collection: `${schema}-mix.labels`,
                data: updatedLabels[schema]
            })
        }

    }
}


const loadDataBufferPart = async (schema, patients) => {
    console.log("REQUIRE", patients.length)

    let pipeline = [{
            $match: {
                patientId: {
                    $in: patients.map(p => p.patientId),
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
                                $in: patients.map(p => p.patientId),
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
        {
            $project: {
                _id: 0
            }
        }
    ]

    let res = await mongodb.aggregate({
        db,
        collection: `${schema}-mix.examinations`,
        pipeline
    })

    res = res.map(d => {
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
                    return d
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
        console.log(`LOAD DATA BUFFER from ${schema}-mix: ${part.length} items`)
        console.log(part.map(p => p.examination.patientId).join(", "))
        DATA_BUFFER = DATA_BUFFER.concat(part)
    }


}


const executePart = async script => {

    await loadDataBuffer(script)

    // console.log(DATA_BUFFER[0])

    let results = []

    for (let command of script) {

        // console.log(`${command.index}: ${command.command}`)

        try {

            let result

            if (command.command == "exchange") {
                result = await executeExchange(command)
            }

            if (command.command == "split") {
                result = await executeSplit(command)
            }

            if (result) {
                // await updateDb(result)
                results.push(result)
            }

            command.done = true

        } catch (e) {

            console.log(command, e.toString(), e.stack)
            command.error = `${e.toString()} ${e.stack}`
            break
        }

    }

    results = {
        store: flatten(results.map(r => r.store || [])),
        remove: flatten(results.map(r => r.remove || [])),
        insert: flatten(results.map(r => r.insert || []))
    }

    await updateDb(results)

    return script

}



const execute = async (START_STAGE, STOP_STAGE, BUFFER_SIZE) => {

    const PAGE_SIZE = BUFFER_SIZE

    let skip = 0
    let bufferCount = 0

    hasError = false

    for (let stage = START_STAGE; stage < STOP_STAGE && !hasError; stage++) {
        do {

            const pipeline = [{
                    '$match': {
                        done: {
                            $exists: false
                        },
                        error: {
                            $exists: false
                        },
                        stage
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

                console.log(`Stage ${stage} ------------------------->  Read buffer ${bufferCount} started at ${skip}: ${buffer.length} items`)


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
}


module.exports = execute