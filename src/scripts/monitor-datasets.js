const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate, groupBy, keys, isString } = require("lodash")
const { loadJSON, unlink } = require("../utils/file-system")
const { saveXLSX } = require("../utils/xlsx")
const path = require("path")


const ROOT = "V3-VALIDATION-TEST-DATA"
const MONITOR = `${ROOT}/!MONITOR`
const RECROOT = `${ROOT}/RECORDINGS`

const TEMP = "./.temp"


const datasets = [
	"v3p__dr",
	{ 
		name: "v3p__dr-EKO", 
		path: `${ROOT}/5.5.1.4.1. Recording of Heart Sound by Qualified Healthcare Professionals (dataset v3PxDr)/Eko CORE 500`
	},	 
	"v3p__ecg", 
	{ 
		name: "v3p__ecg-EKO", 
		path: `${ROOT}/5.5.1.5.1. Simultaneous recording of heart sound and ECG (dataset V3PxECG)/Eko CORE 500`
	},
	"v3p__repeathr",
	{ 
		name: "v3p__repeathr-EKO", 
		path: `${ROOT}/5.5.1.5.2. Simultaneous recording of heart sound and ECG (dataset v3PxRepeatHR)/Eko CORE 500`
	},
	"v3p__repeatmur",
	"v3p__self",
	"v3qty_cardiac",
	"v3qty_cardiaccotton",
	"v3qty_cardiacwool",
	"v3qty_arm",
	"v3qty_ambi",
	"v3participant__",
	"v3ptself__",
	"v3iph_dtod__",
	{ 
		name: "v3iph_dtod__-EKO", 
		path: `${ROOT}/5.5.5. Preparation 1: Recordings of the chest sound of a healthy pseudo patient by one qualified healthcare professional (datasets v3EkoCORExDtoD)/Eko CORE 500`
	},
	
	"v3iph__pspt",
	"v3iph_operators",
	{ 
		name: "v3iph_dtod__-EKO", 
		path: `${ROOT}/5.5.6. Recordings of the Chest Sound of a Healthy Pseudo Patient by Five Testers (datasets v3EkoCORExOperators)/Eko CORE 500`
	},
	"v2iph__pspt",
	"v2participant__",
	"v2ptself__"
]

const delay = ms => new Promise( resolve => {
	setTimeout(() => {resolve()}, ms)
})

const prepareFiles = async path => {
	let googleDrive = await googledriveService.create(path)
	return googleDrive	 
}


processRecords = async dataset => {

		let drive = await prepareFiles(RECROOT)
		let file = drive.fileList(dataset.path)[0]
		
		if(file){
			console.log("Download", file.path)	
			await drive.downloadFiles({
				fs: TEMP,
				googleDrive: [file]
			})
			await delay(1000)
			console.log("Load JSON", `${TEMP}/${file.name}`)	
			
			let data 
			
			try {
				data = loadJSON(`${TEMP}/${file.name}`)
			} catch (e) {
				data = loadJSON(`${TEMP}/${file.name}`)
			}

			if( !data || data.length == 0) return []

			data = data.map( d => {
				delete d.segments
				return d
			})

			data = sortBy(data, d => d.patient_id)

			return data
		
		} else {
			return []
		}	
}

const processFiles = async dataset => {
	console.log("Load file list:", `${dataset.path}/files`)
	let drive =  await prepareFiles(`${dataset.path}/files`)
	let data = drive.fileList().map( d => ({file: d.name}))
	return data
}


const run = async () => {

	let allDatasets = []
	let drive = await prepareFiles(`${ROOT}`)

	for(let i = 0; i < datasets.length; i++){
		
		let dataset = ( isString(datasets[i]) ) 
			? {
				name: datasets[i],
				path: `${RECROOT}/${datasets[i]}/${datasets[i]}.json`,
				recordList: true  
			}
			: datasets[i]

		console.log(i+1," from ",datasets.length, ": ", dataset)
		
		let data = []
		
		if(dataset.recordList){
			data = await processRecords(dataset)
			data = data.map( d => {
				delete d.segments
				return d
			})

			data = sortBy(data, d => d.patient_id)

		} else {
			data = await processFiles(dataset)
			data = sortBy(data, d => d.file)
		}


		allDatasets.push({
			dataset: dataset.name,
			recordings: data.length,  
			patients: (dataset.recordList) ? keys(groupBy(data, d => d.patient_id)).length : "N/A",
			path: dataset.path
		})
			
		if(data.length > 0){		
			console.log("Save xlsx", `${TEMP}/${dataset.name}.xlsx`)
			await saveXLSX(
				data,
				`${TEMP}/${dataset.name}.xlsx`,
				"data"
			)
		}	

		console.log("Upload", `${TEMP}/${dataset.name}.xlsx`, "into", (dataset.recordList) ? path.dirname(dataset.path) : dataset.path)
				
		await drive.uploadFiles({
			fs: [`${TEMP}/${dataset.name}.xlsx`],
			googleDrive: (dataset.recordList) ? path.dirname(dataset.path) : dataset.path
		})

		// await unlink(`${TEMP}/${dataset.name}.xlsx`)

		// await unlink(`${TEMP}/${file.name}`)
		
	}

	await saveXLSX(
		allDatasets,
		`${TEMP}/datasets.xlsx`,
		"data"
	)

	drive = await prepareFiles(`${MONITOR}`)
	await drive.uploadFiles({
		fs: [`${TEMP}/datasets.xlsx`],
		googleDrive:`${MONITOR}`
	})

	
}

run()

