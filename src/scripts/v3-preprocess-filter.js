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

const EKOFILES = `${RECROOT}/PT.11.2.2 v2ekocorefilter_/files/*.*`
// const MICFILES = `${RECROOT}/PT.10.8.2 v2micwn/files/*.*`
// const SRCFILES = `${RECROOT}/PT.10.8.2 v2sourcewn/files/*.*`

// const IPHMETA = `${RECROOT}/PT.10.8.2 v2iph_wn/v2iph_wn.json`
const IPHFILES = `${RECROOT}/PT.11.2.2 v2stethophonefilter_/files/*.*`

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

//v2-filter-ekocore-bell-01.wav
const parseEkoFileName = name => {
	let d = name.split(/[\-\.]/g)
	return {
		device: d[2],
		filter: d[3],
		recording: d[4]
	}
}

//v2-filter-iPhone 12 mini-diaphragm-01.wav
const parseStFileName = name => {
	let d = name.split(/[\-\.]/g)
	return {
		device: d[2],
		filter: d[3],
		recording: d[4]
	}
}


const downloadMeta = async () => {
	
	let dataSt = []
	let dataEko = []
	
	let drive = await prepareFiles(RECROOT)
	
	// let file = drive.fileList(IPHMETA)[0]
	
	// if(file){
			
	// 		console.log("Download", file.path)	
			
	// 		await drive.downloadFiles({
	// 			fs: TEMP,
	// 			googleDrive: [file]
	// 		})
	// 		await delay(1000)
			
	// 		console.log("Load JSON", `${TEMP}/${file.name}`)	
			
			
			
	// 		try {
	// 			dataSt = loadJSON(`${TEMP}/${file.name}`)
	// 		} catch (e) {
	// 			dataSt = loadJSON(`${TEMP}/${file.name}`)
	// 		}

	// 		let filepool = drive.fileList(IPHFILES)

	// 		dataSt = dataSt.map( d => {
				
	// 			let f = find(filepool, f => f.name == `${d.file_id}.wav`)
	// 			delete d.segments
				
	// 			return extend({
	// 				file: f,
	// 			}, parseStPatientId(d.patient_id))
			
	// 		})		
	// }

	dataSt = drive.fileList(IPHFILES)
	dataSt = dataSt.map( d => extend({}, parseStFileName(d.name), { file: d }))

	dataEko = drive.fileList(EKOFILES)
	dataEko = dataEko.map( d => extend({}, parseEkoFileName(d.name), { file: d })) 
	// console.log(dataEko)
	// dataMic = drive.fileList(MICFILES)
	// dataMic = dataMic.map( d => extend({}, parseEkoFileName(d.name), { file: d })) 

	// dataSrc = drive.fileList(SRCFILES)
	// dataSrc = dataSrc.map( d => extend({}, parseEkoFileName(d.name), { file: d })) 

	return dataSt.concat(dataEko)	
}

const downloadWavs = async (googleDrive, fs) => {
	let drive = await prepareFiles(RECROOT)
	await drive.downloadFiles({googleDrive, fs})
}




const run = async () => {
	// let meta = await downloadMeta()
	// console.log(meta)

	// let ekoHeartMeta = meta.filter(m => m.device == 'ekocore' && m.type == 'heart')
	// let ekoHeart = meta.map(m => m.file)

	// await downloadWavs( ekoHeart, `${TEMP}/eko-heart`)

	let list = [
		"./data/wav/v3-pt-2024/Filters iPhone 11/v2/Bell/*.wav",
		"./data/wav/v3-pt-2024/Filters iPhone 11/v2/Diaphragm/*.wav",
		"./data/wav/v3-pt-2024/Filters iPhone 11/v2/Starling/*.wav",
		"./data/wav/v3-pt-2024/Filters iPhone 11/v3/Bell/*.wav",
		"./data/wav/v3-pt-2024/Filters iPhone 11/v3/Diaphragm/*.wav",
		"./data/wav/v3-pt-2024/Filters iPhone 11/v3/Starling/*.wav",
		"./data/wav/v3-pt-2024/Filters iPhone 12/v2/Bell/*.wav",
		"./data/wav/v3-pt-2024/Filters iPhone 12/v2/Diaphragm/*.wav",
		"./data/wav/v3-pt-2024/Filters iPhone 12/v2/Starling/*.wav",
		"./data/wav/v3-pt-2024/Filters iPhone 12/v3/Bell/*.wav",
		"./data/wav/v3-pt-2024/Filters iPhone 12/v3/Diaphragm/*.wav",
		"./data/wav/v3-pt-2024/Filters iPhone 12/v3/Starling/*.wav",
		"./data/wav/v3-pt-2024/Filters iPhone 15/v2/Bell/*.wav",
		"./data/wav/v3-pt-2024/Filters iPhone 15/v2/Diaphragm/*.wav",
		"./data/wav/v3-pt-2024/Filters iPhone 15/v2/Starling/*.wav",
		"./data/wav/v3-pt-2024/Filters iPhone 15/v3/Bell/*.wav",
		"./data/wav/v3-pt-2024/Filters iPhone 15/v3/Diaphragm/*.wav",
		"./data/wav/v3-pt-2024/Filters iPhone 15/v3/Starling/*.wav",
		"./data/wav/v3-pt-2024/NTI WN/records/*.wav"
	]

	list = list.map( d => {
		let s = d.split("/")
		let device = (s[4] == "NTI WN") ? s[4] : s[4].split(" ").slice(1).join(" ")
		let version = (s[4] == "NTI WN") ? undefined : s[5]
		let filter = (s[4] == "NTI WN") ? undefined : s[6]
		return {
			device,
			version,
			filter,
			path: d
		}


	})

	let res = []

	for( let l of list){

		console.log(l.path)
		
		let s = await wav2spectrum({
			fs: l.path,
			metadata: { message: "v3-filter"}, 
			params: { frequency:{range: [0, 2000]}} 
		})

		s = s.map( r => {

			return extend({
				id: (l.device == "NTI WN") ? "NTI" : `${l.device}.${l.version}.${l.filter}`,
				device: l.device,
				filter: l.filter,
				version: l.version,
				filename: r.metadata.fileName
			}, r.spectrum)
		})

		res = res.concat(s)

	}	

	await saveXLSX(
		sortBy(res, r => r.device),
		"./data/structures/V3-PT-Validation-2024/SPECTRA/v3-pt-filter.xlsx"
	)


}




run()

