const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate, groupBy, keys, isString, last } = require("lodash")
const { loadJSON, unlink, filesize } = require("../utils/file-system")
const { saveXLSX } = require("../utils/xlsx")
const path = require("path")
const moment = require("moment")

const ROOT = "V3-VALIDATION-TEST-DATA"
const MONITOR = `V2-VALIDATION-TEST-DATA/!MONITOR`
const RECROOT = `V3-VALIDATION-TEST-DATA/RECORDINGS`

const TEMP = "./.temp"


const datasets = require("./v2-datasets.json")

const delay = ms => new Promise( resolve => {
	setTimeout(() => {resolve()}, ms)
})

const prepareFiles = async path => {
	let googleDrive = await googledriveService.create(path)
	return googleDrive	 
}

const getDevice = name => {
	let a = name.split("-")
	let res = 
		(a[2].startsWith("iPhone") || a[2].startsWith("eko")) ? a[2] : undefined
	return res	
}

processRecords = async (dataset, meta) => {

		let drive = await prepareFiles(RECROOT)
		let file = drive.fileList(`${RECROOT}/${meta}`)[0]
		
		let recordingPath = path.dirname(`${RECROOT}/${meta}`)+"/files/*.*"
		console.log("!Recording folder: ", recordingPath)


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

			let filepool = drive.fileList(recordingPath)
			
			let actualFileList = data.map( d => `${d.file_id}.wav`)
			console.log("Actual File List (", actualFileList.length, "items): ", actualFileList)
			
			
			let deletedFiles = filepool.filter( f => !actualFileList.includes(f.name))
			
			console.log("Should be delete ", deletedFiles.length, "files")
			console.log(deletedFiles.map(d => d.name))
			


			return data.map(d => {
				
				let fileMeta = find(filepool, f => f.name == `${d.file_id}.wav`)
				
				if(!fileMeta){
					console.log(`Needed file ${d.file_id}.wav NOT EXISTS`)
				}

				return {
					protocol: meta.split("/")[0],
					dataset: dataset.folder,
					device: getDevice(d.patient_id),
					stage: "files",
					patientId: d.patient_id,
					type: d.record_type,
					spot: d.record_spot,
					file: `${d.file_id}.wav`,
					size: (fileMeta) ? filesize(fileMeta.size).humanize("Si") : "N/A",
					createdAt: moment(d.file_created_at).format("YYYY-MM-DD HH:mm:ss") 
				}
			})
		
		} else {
			return []
		}	
}

const processFiles = async (dataset, folder) => {
	console.log("Load file list:", `${RECROOT}/${folder}`)
	let drive =  await prepareFiles(`${RECROOT}/${folder}`)
	let data = drive.fileList()//.map( d => ({file: d.name}))
	
	return data.map(d => ({
				protocol: folder.split("/")[0],
				dataset: dataset.folder,
				device: getDevice(d.name),
				stage: last(folder.split("/")),
				// patientId: d.patient_id,
				// spot: d[],
				file: d.name,
				size: filesize(d.size).humanize("Si"),
				createdAt: moment(d.modifiedTime).format("YYYY-MM-DD HH:mm:ss") 
			}))
}


const run = async () => {

	let allDatasets = []
	let drive = await prepareFiles(`${ROOT}`)

	for(let i = 0; i < datasets.length; i++){

		let dataset = datasets[i]

		for( let j=0; j < dataset.path.length; j++){
			let fold = dataset.path[j]
			let data = []
		
			if(fold.meta){
				data = await processRecords(dataset, fold.meta)
				data = data.map( d => {
					delete d.segments
					return d
				})

				data = sortBy(data, d => d.patient_id)

			} else {
				data = await processFiles(dataset, fold.folder)
				data = sortBy(data, d => d.file)
			}

			allDatasets = allDatasets.concat(data)
		}

	}	
		

		
			
		// if(data.length > 0){		
		// 	console.log("Save xlsx", `${TEMP}/v2-wav-files.xlsx`)
		// 	await saveXLSX(
		// 		data,
		// 		`${TEMP}/v2-wav-files.xlsx`,
		// 		"data"
		// 	)
		// }	

		// console.log("Upload", `${TEMP}/${dataset.name}.xlsx`, "into", (dataset.recordList) ? path.dirname(dataset.path) : dataset.path)
				
		// await drive.uploadFiles({
		// 	fs: [`${TEMP}/${dataset.name}.xlsx`],
		// 	googleDrive: (dataset.recordList) ? path.dirname(dataset.path) : dataset.path
		// })

		// await unlink(`${TEMP}/${dataset.name}.xlsx`)

		// await unlink(`${TEMP}/${file.name}`)
		
	// }

	allDatasets = sortBy(allDatasets, d => d.protocol)
	
	await saveXLSX(
		allDatasets,
		`${TEMP}/v2-wav-files.xlsx`,
		"data"
	)

	drive = await prepareFiles(`${MONITOR}`)
	await drive.uploadFiles({
		fs: [`${TEMP}/v2-wav-files.xlsx`],
		googleDrive:`${MONITOR}`
	})

	
}

run()

