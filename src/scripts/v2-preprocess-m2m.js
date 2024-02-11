const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate, groupBy, keys, isString, last } = require("lodash")
const { loadJSON, unlink, filesize } = require("../utils/file-system")
const { saveXLSX } = require("../utils/xlsx")
const path = require("path")
const moment = require("moment")
const wav2spectrum  = require("../utils/wav2spectrum")


const ROOT = "V3-VALIDATION-TEST-DATA"
const PREPROCESS = `V2-VALIDATION-TEST-DATA/!PREPROCESS`

const RECROOT = `V3-VALIDATION-TEST-DATA/RECORDINGS`

const EKOFILES = `${RECROOT}/RRT.8.7.2 v2ekocorep_m2m/files/*.*`

const IPHMETA = `${RECROOT}/RRT.8.7.2 v2iph__p__m2m/v2iph_p_m2m.json`
const IPHFILES = `${RECROOT}/RRT.8.7.2 v2iph__p__m2m/processed/*.*`

const TEMP = "./.temp"

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

//v2-operators-ekocore-raw-01-heart-01.wav
const parseEkoFileName = name => {
	let d = name.split(/[\-\.]/g)
	return {
		device: d[2],
		type: (["01","02","03","04","05","06","07","08","09","10"].includes(d[4])) ? "heart" : "lungs"
	}
}

//v2-m2m-iPhone 15 Pro
const parseStPatientId = name => {
	let d = name.split("-")
	return {
		device: last(d)
	}
}


const downloadMeta = async () => {
	
	let dataSt = []
	let dataEko = []

	let drive = await prepareFiles(RECROOT)
	
	let file = drive.fileList(IPHMETA)[0]
	
	if(file){
			
			console.log("Download", file.path)	
			
			await drive.downloadFiles({
				fs: TEMP,
				googleDrive: [file]
			})
			await delay(1000)
			
			console.log("Load JSON", `${TEMP}/${file.name}`)	
			
			
			
			try {
				dataSt = loadJSON(`${TEMP}/${file.name}`)
			} catch (e) {
				dataSt = loadJSON(`${TEMP}/${file.name}`)
			}

			let filepool = drive.fileList(IPHFILES)

			dataSt = dataSt.map( d => {
				
				let f = find(filepool, f => f.name == `${d.file_id}.wav`)
				delete d.segments
				
				return extend({
					type: d.record_type,
					file: f,
				}, parseStPatientId(d.patient_id))
			
			})		
	}

	dataEko = drive.fileList(EKOFILES)
	dataEko = dataEko.map( d => extend({}, parseEkoFileName(d.name), { file: d })) 

	return dataSt.concat(dataEko)	
}

const downloadWavs = async (googleDrive, fs) => {
	let drive = await prepareFiles(RECROOT)
	await drive.downloadFiles({googleDrive, fs})
}




const run = async () => {
	let meta = await downloadMeta()
	// console.log(meta)

	// let ekoHeartMeta = meta.filter(m => m.device == 'ekocore' && m.type == 'heart')
	let ekoHeart = meta.map(m => m.file)

	// await downloadWavs( ekoHeart, `${TEMP}/eko-heart`)

	let res = await wav2spectrum({
		fs: `${TEMP}/m2m/*.wav`,
		metadata: { message: "v2-m2m"}, 
		params: { frequency:{range: [0, 2000]}} 
	})

	res = res.map( r => {
		let f = find(meta, f => f.file.name == r.metadata.fileName)
		return extend({
			dataset: r.metadata.message,
			device: (f) ? f.device : "N/A",
			type: (f) ? f.type : "N/A",
			filename: r.metadata.fileName
		}, r.spectrum)
	})

	await saveXLSX(
		sortBy(res, r => r.type),
		"./data/processed/v2-m2m.xlsx"
	)


}




run()

