const googledriveService = require("../utils/google-drive")
const { loadXLSX, saveXLSX } = require("../utils/xlsx")
const { writeFile, loadJSON } = require("../utils/file-system")
const { extend, sortBy, find, truncate, groupBy, keys } = require("lodash")
const { avg, std, anomals } = require("../utils/stat")


const RECORDINGS_FOLDER = "RECORDINGS"
const INPUT_REC_DATA_FOLDER = "v3p__repeathr"

const INPUT_DATA_FOLDER = "5.5.1.5.2. Simultaneous recording of heart sound and ECG (dataset v3PxRepeatHR)/EKO CORE 500"
const INPUT_HR_DATA_XLSX = "R-R intervals.xlsx"
const INPUT_REC_MAP_XLSX = "record matching.xlsx"

const RESULT_HEART_RATE_XLSX = "heart_rate_repeat.xlsx"


const ROOT = "V3-VALIDATION-TEST-DATA"
const PREPROCESS = `${ROOT}/!PREPROCESS`
const HR_DATA = `${PREPROCESS}/${RESULT_HEART_RATE_XLSX}`

const TEMP = "./.temp"



const delay = ms => new Promise(resolve => {
    setTimeout(() => { resolve() }, ms)
})

const prepareFiles = async path => {
    let googleDrive = await googledriveService.create(path)
    return googleDrive
}


const getDuration = timeline => {
    let duration = []
    for (let i = 0; i < timeline.length - 1; i++) {
        duration.push(timeline[i + 1] - timeline[i])
    }
    return duration
}

const checkIntervals = timeline => {
    timeline = sortBy(timeline)
    let duration = getDuration(timeline)
    return anomals(duration)

}




const run = async () => {

    let drive = await prepareFiles(ROOT)

    let file = drive.fileList(`${RECORDINGS_FOLDER}/${INPUT_REC_DATA_FOLDER}/${INPUT_REC_DATA_FOLDER}.json`)[0]

    let data = []
    let st_data = []
    let rMap = []

    file = {
        name: `${INPUT_REC_DATA_FOLDER}.json`
    }


    // if(file){

    // 	console.log("Download", file.path)	
    // 	await drive.downloadFiles({
    // 		fs: TEMP,
    // 		googleDrive: [file]
    // 	})
    // 	await delay(1000)
    console.log("Load JSON", `${TEMP}/${file.name}`)
    st_data = loadJSON(`${TEMP}/${file.name}`)
    // }	


    file = drive.fileList(`${INPUT_DATA_FOLDER}/${INPUT_HR_DATA_XLSX}`)[0]

    // if(file){
    // 	console.log("Download", file.path)	
    // 	await drive.downloadFiles({
    // 		fs: TEMP,
    // 		googleDrive: [file]
    // 	})
    // 	await delay(1000)


    file = {
        name: `${INPUT_HR_DATA_XLSX}`
    }

    console.log("Load XLSX", `${TEMP}/${file.name}`)

    data = await loadXLSX(
        `${TEMP}/${file.name}`,
        "data"
    )

    // }


    file = drive.fileList(`${INPUT_DATA_FOLDER}/${INPUT_REC_MAP_XLSX}`)[0]

    // if(file){
    // 	console.log("Download", file.path)	
    // 	await drive.downloadFiles({
    // 		fs: TEMP,
    // 		googleDrive: [file]
    // 	})
    // 	await delay(1000)


    file = {
        name: `${INPUT_REC_MAP_XLSX}`
    }

    console.log("Load XLSX", `${TEMP}/${file.name}`)

    rMap = await loadXLSX(
        `${TEMP}/${file.name}`,
        "data"
    )

    // }

    st_data = st_data.map(s => {


        let res = {
            ST_heartRate: s.heart_rate
        }

        let f = find(rMap, r => s.file_id == r["Stetophone file ID"])

        if (f) {
            res.recordId = f['Recording ID']
            res.patientId = res.recordId.replace(/(v3p)([0-9]{2}).*/, "$2")
            res.measure = res.recordId.replace(/(.*)(-m)([0-9]{2})$/, "$3")
        } else {
            return res
        }

// if(res.recordId.startsWith("v3p11repeathr")){
//     sortBy(s.segments, seg => seg.start).forEach( seg => {
//         console.log(res.recordId,"\t",seg.type,"\t",seg.start)
//     })
// }


        let t = sortBy(data.filter(d => d['Recording ID'] == res.recordId), d => d["Cardio Cicle"]).map(d => d.R)

        let anomals = checkIntervals(t)

        if (anomals.length > 0) {
            anomals = anomals.map((data, index) => {
                data.recording = res.recordId
                data.cardioCicle = data.index + 1
                data.start = t[data.index]
                data.duration = data.value
                delete data.value
                delete data.index
                return data
            })
            console.log("ANOMALIES:", anomals)
        }

        let c = []
        for (let i = 0; i < t.length - 1; i++) {
            c.push(60 / (t[i + 1] - t[i]))
        }

        res.EKO_heartRate = Number.parseInt((c.reduce((a, b) => a + b) / c.length).toFixed(0))

        return res

    }).filter(s => s.recordId)

    // st_data = groupBy(st_data, s => s.patientId)

    // let res = keys(st_data).map(patientId => {
    //     let r = {
    //         patientId
    //     }
    //     data = st_data[patientId].filter(d => d.patientId == patientId)
    //     data.forEach(d => {
    //         r["ST_" + d.measure + "_HR"] = d.ST_heartRate
    //         r["EKO_" + d.measure + "_HR"] = d.EKO_heartRate
    //     })

    //     return r
    // })


    await saveXLSX(
        st_data,
        `${TEMP}/${RESULT_HEART_RATE_XLSX}`,
        "data"
    )

    // console.log(`UPLOAD: ${TEMP}/test-2-1-result.txt into ${TEST_RESULTS}`)
    // await drive.uploadFiles({
    // 	fs: [`${TEMP}/test-1-1-result.txt`],
    // 	googleDrive:`${TEST_RESULTS}`
    // })


}

run()