const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate, groupBy, keys } = require("lodash")
const { loadJSON, unlink } = require("../utils/file-system")
const { saveXLSX, loadXLSX } = require("../utils/xlsx")

const datasets = [
	"v3p__dr", 
	"v3p__ecg", 
	"v3p__repeathr", 
	"v3p__self",
	"v3qty_cardiac",
	"v3qty_cardiaccotton",
	"v3qty_cardiacwool",
	"v3qty_arm",
	"v3qty_ambi"
]

const ROOT = "V3-VALIDATION-TEST-DATA"
const PREPROCESS = `${ROOT}/!PREPROCESS`

const ST_RECORDS = `${ROOT}/RECORDINGS/v3p__ecg/v3p__ecg.json`

const EKO_RECORDS = `${ROOT}/5.5.1.5.1. Simultaneous recording of heart sound and ECG (dataset V3PxECG)/Eko CORE 500/R-R intervals.xlsx`

const TEMP = "./.temp"


const delay = ms => new Promise( resolve => {
	setTimeout(() => {resolve()}, ms)
})

const prepareFiles = async path => {
	let googleDrive = await googledriveService.create(path)
	return googleDrive	 
}


const run = async () => {

	let drive = await prepareFiles(ROOT)

	let file = drive.fileList(ST_RECORDS)[0]
	
	let eko_data
	let st_data

	if(file){
		console.log("Download", file.path)	
		await drive.downloadFiles({
			fs: TEMP,
			googleDrive: [file]
		})
		await delay(1000)
		console.log("Load JSON", `${TEMP}/${file.name}`)	
		
		try {
			st_data = loadJSON(`${TEMP}/${file.name}`)
		} catch (e) {
			st_data = loadJSON(`${TEMP}/${file.name}`)
		}
	}

	file = drive.fileList(EKO_RECORDS)[0]
	
	if(file){
		console.log("Download", file.path)	
		await drive.downloadFiles({
			fs: TEMP,
			googleDrive: [file]
		})
		await delay(1000)
		console.log("Load XLSX", `${TEMP}/${file.name}`)	
		
		eko_data = await loadXLSX(
			`${TEMP}/${file.name}`,
			"data"
		)
	}

	if(!st_data || !eko_data) return

	st_data = st_data.map(d => ({recordId: d.patient_id, ST_heartRate: d.heart_rate}))	
	
	let temp = groupBy( eko_data, d => d["Recording ID"])
	
	eko_data = keys(temp).map( key => {
		
		
		let t = sortBy(temp[key], d => d["Cardio Cicle"]).map( d => d.R)
		let c = []
		for(let i=0; i < t.length-1; i++){
			c.push( 60 /(t[i+1] - t[i]) )
		}
		let heartRate = Number.parseInt((c.reduce((a,b) => a+b) / c.length).toFixed(0))
		
		return {
			recordId: key,
			EKO_heartRate: heartRate
		}

	})

		
	result = st_data.concat(eko_data)
	let g = groupBy(result, d => d.recordId)
	result = keys(g).map( key => extend({}, g[key][0], g[key][1]) )

	
	await saveXLSX(
		result,
		`${TEMP}/heart_rate.xlsx`,
		"data"
	)

	drive = await prepareFiles(`${ROOT}`)
	console.log(`UPLOAD: ${TEMP}/heart_rate.xlsx into ${PREPROCESS}`)
	await drive.uploadFiles({
		fs: [`${TEMP}/heart_rate.xlsx`],
		googleDrive:`${PREPROCESS}`
	})

	await unlink(`${TEMP}/heart_rate.xlsx`)
	
	
}

run()

