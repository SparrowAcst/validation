const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate, groupBy, keys } = require("lodash")
const { loadJSON, unlink } = require("../utils/file-system")
const { saveXLSX } = require("../utils/xlsx")

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
const MONITOR = `${ROOT}/!MONITOR`
const RECROOT = `${ROOT}/RECORDINGS`
const EKODR = `${ROOT}/5.5.1.4.1. Recording of Heart Sound by Qualified Healthcare Professionals (dataset v3PxDr)/Eko CORE 500`
const EKOECG = `${ROOT}/5.5.1.5.1. Simultaneous recording of heart sound and ECG (dataset V3PxECG)/Eko CORE 500`

const TEMP = "./.temp"


const delay = ms => new Promise( resolve => {
	setTimeout(() => {resolve()}, ms)
})

const prepareFiles = async path => {
	let googleDrive = await googledriveService.create(path)
	return googleDrive	 
}


const run = async () => {

	let allDatasets = []

	let drive = await prepareFiles(RECROOT)
	
	for(let i = 0; i < datasets.length; i++){
		dataset = datasets[i]
		console.log(i+1," from ",datasets.length, ": ", dataset)

		let file = drive.fileList(`${RECROOT}/${dataset}/${dataset}.json`)[0]
		
		if(file){
			console.log("Download", file.path)	
			await drive.downloadFiles({
				fs: TEMP,
				googleDrive: [file]
			})
			console.log("Delay")
			await delay(1000)
			console.log("Load JSON", `${TEMP}/${file.name}`)	
			
			let data 
			
			try {
				data = loadJSON(`${TEMP}/${file.name}`)
			} catch (e) {
				data = loadJSON(`${TEMP}/${file.name}`)
			}

			data = data.map( d => {
				delete d.segments
				return d
			})

			data = sortBy(data, d => d.patient_id)

			allDatasets.push({
				dataset,
				recordings: data.length,  
				patients: keys(groupBy(data, d => d.patient_id)).length,
				path: `${RECROOT}/${dataset}`
			})
			
			console.log("Save xlsx", `${TEMP}/${dataset}.xlsx`)

			await saveXLSX(
				data,
				`${TEMP}/${dataset}.xlsx`,
				"data"
			)

			console.log("Upload", `${TEMP}/${dataset}.xlsx`, "into", `${RECROOT}/${dataset}`)
			
			await drive.uploadFiles({
				fs: [`${TEMP}/${dataset}.xlsx`],
				googleDrive:`${RECROOT}/${dataset}`
			})

			await unlink(`${TEMP}/${dataset}.xlsx`)
			await unlink(`${TEMP}/${file.name}`)
				
		
		} else {
			console.log("skip")
			allDatasets.push({
				dataset, 
				recordings: 0, 
				patients: 0,
				path: `${RECROOT}/${dataset}`, 
			})
			
		}
	}

	drive = await prepareFiles(`${EKODR}/files`)
	allDatasets.push({
		dataset: "v3p__dr-EKO",
		recordings: drive.fileList().length,
		patients: keys( groupBy(drive.fileList().map( f => f.name.split("-")[0]))).length,
		path:EKODR
	})	


	drive = await prepareFiles(`${EKOECG}/files`)
	allDatasets.push({
		dataset: "v3p__ecg-EKO",
		recordings: drive.fileList().length,
		patients: keys( groupBy(drive.fileList().map( f => f.name.split("-")[0]))).length,
		path:EKOECG
	})	


	await saveXLSX(
		allDatasets,
		`${TEMP}/datasets.xlsx`,
		"data"
	)

	drive = await prepareFiles(`${ROOT}`)
	await drive.uploadFiles({
		fs: [`${TEMP}/datasets.xlsx`],
		googleDrive:`${MONITOR}`
	})

	await unlink(`${TEMP}/datasets.xlsx`)
	
	
}

run()

