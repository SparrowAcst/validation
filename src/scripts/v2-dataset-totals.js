const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate, groupBy, keys, isString, last, uniqBy } = require("lodash")
const { loadJSON, unlink, filesize } = require("../utils/file-system")
const { saveXLSX,loadXLSX} = require("../utils/xlsx")
const path = require("path")
const moment = require("moment")
const wav2spectrum  = require("../utils/wav2spectrum")


const ROOT = "V3-VALIDATION-TEST-DATA"
const PREPROCESS = `V2-VALIDATION-TEST-DATA/!PREPROCESS`

const RECROOT = `V3-VALIDATION-TEST-DATA/RECORDINGS`

const EKOFILES = `${RECROOT}/PT.10.8.2 v2ekocorewn/files/*.*`
const MICFILES = `${RECROOT}/PT.10.8.2 v2micwn/files/*.*`
const SRCFILES = `${RECROOT}/PT.10.8.2 v2sourcewn/files/*.*`

const IPHMETA = `${RECROOT}/PT.10.8.2 v2iph_wn/v2iph_wn.json`
const IPHFILES = `${RECROOT}/PT.10.8.2 v2iph_wn/processed/*.*`

const TEMP = "./.temp"

const delay = ms => new Promise( resolve => {
	setTimeout(() => {resolve()}, ms)
})

const prepareFiles = async path => {
	let googleDrive = await googledriveService.create(path)
	console.log(googleDrive.fileList())
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
		device: d[2]
	}
}

//v2-wn-iPhone 15 Plus
const parseStPatientId = name => {
	let d = name.split("-")
	return {
		device: last(d)
	}
}


const downloadMeta = async () => {
	
	let dataSt = []
	let dataEko = []
	let dataMic = []
	let dataSrc = []

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
					file: f,
				}, parseStPatientId(d.patient_id))
			
			})		
	}

	dataEko = drive.fileList(EKOFILES)
	dataEko = dataEko.map( d => extend({}, parseEkoFileName(d.name), { file: d })) 

	dataMic = drive.fileList(MICFILES)
	dataMic = dataMic.map( d => extend({}, parseEkoFileName(d.name), { file: d })) 

	dataSrc = drive.fileList(SRCFILES)
	dataSrc = dataSrc.map( d => extend({}, parseEkoFileName(d.name), { file: d })) 

	return dataSt.concat(dataEko).concat(dataMic).concat(dataSrc)	
}

const downloadWavs = async (googleDrive, fs) => {
	let drive = await prepareFiles(RECROOT)
	await drive.downloadFiles({googleDrive, fs})
}




const run = async () => {
	let meta = await downloadMeta()
	// console.log(meta)

	// // let ekoHeartMeta = meta.filter(m => m.device == 'ekocore' && m.type == 'heart')
	// // let ekoHeart = meta.map(m => m.file)

	// // await downloadWavs( ekoHeart, `${TEMP}/eko-heart`)

	// let res = await wav2spectrum({
	// 	fs: `${TEMP}/fr/*.wav`,
	// 	metadata: { message: "v2-fr"}, 
	// 	params: { frequency:{range: [0, 2000]}} 
	// })

	// res = res.map( r => {
	// 	let f = find(meta, f => f.file.name == r.metadata.fileName)
	// 	return extend({
	// 		dataset: r.metadata.message,
	// 		device: f.device,
	// 		filename: r.metadata.fileName
	// 	}, r.spectrum)
	// })

	// let data = await loadXLSX("./data/processed/v2-datasets.xlsx", "files")
	// data = groupBy(data, d => d.dataset)

	// let res = []
	
	// keys(data).forEach(dkey => {
		
	// 	console.log("Dataset:", dkey)
		
	// 	let d = data[dkey]
	// 	let stages = groupBy(d, r => r.stage)
	
	// 	keys(stages).forEach( skey => {
			
	// 		console.log("Stage:", dkey)
			
	// 		let stage = stages[skey]
	// 		let Devices = uniqBy(stage.map(r => r.device).filter(r => r))
	// 		Devices = (Devices.length > 0) ? Devices.join(", ") : "N/A"
	// 		res.push({
	// 			Dataset: dkey,
	// 			Stage: skey,
	// 			Files: stage.length,
	// 			Devices  
	// 		})	
	
	// 	})
	
	// })	

	// // console.log(res)

	// await saveXLSX(
	// 	res,
	// 	"./data/processed/v2-dataset-totals.xlsx"
	// )


}




run()

