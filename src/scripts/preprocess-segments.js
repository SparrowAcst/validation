const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate, groupBy, keys } = require("lodash")
const { loadJSON, unlink } = require("../utils/file-system")
const { saveXLSX, loadXLSX } = require("../utils/xlsx")
const { avg, std, anomals } = require("../utils/stat")

const { fitSegmentations } = require("../utils/fit-segments")

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

const EKO_RECORDS = `${ROOT}/5.5.1.5.1. Simultaneous recording of heart sound and ECG (dataset V3PxECG)/Eko CORE 500/segments.xlsx`

const TEMP = "./.temp"


const delay = ms => new Promise( resolve => {
	setTimeout(() => {resolve()}, ms)
})

const prepareFiles = async path => {
	let googleDrive = await googledriveService.create(path)
	return googleDrive	 
}


const getDuration = timeline => {
	let duration = []
	for(let i=0; i < timeline.length-1; i++){
		duration.push( timeline[i+1] - timeline[i] )
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
	

	// st_data = loadJSON(`${TEMP}/v3p__ecg.json`) 

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

	// eko_data = await loadXLSX(
	// 		`${TEMP}/segments.xlsx`,
	// 		"data"
	// 	)

	if(!st_data || !eko_data) return
	
	let temp = groupBy( eko_data, d => d["Recording ID"])
	
	eko_data = keys(temp).map( key => {
		
		let t = sortBy(temp[key], d => d.start)
		let anomals = checkIntervals(t.filter(d => d.Segment == "s1").map(d => d.start))
		if(anomals.length > 0){
			anomals = anomals.map( (data, index) => {
				data.recording = key
				data.timeIndex = data.index+1
				data.start = t[data.index] 
				data.form = EKO_RECORDS
				delete data.value
				delete data.index
				return data
			})
			console.log("ANOMALIES S1:", anomals)
		}
		
		anomals = checkIntervals(t.filter(d => d.Segment == "s2").map(d => d.start))
		if(anomals.length > 0){
			anomals = anomals.map( (data, index) => {
				data.recording = key
				data.timeIndex = data.index+1
				data.start = t[data.index] 
				data.form = EKO_RECORDS
				delete data.value
				delete data.index
				return data
			})
			console.log("ANOMALIES S2:", anomals)
		}
		
		return {
			recordId: key,
			EKO_segments: t.map( d => ({type: d.Segment, start: d.Start}))
		}

	})

	eko_data = eko_data.map( d => {
		let f = find(st_data, t => t.patient_id == d.recordId)
		d.ST_segments = (f) ? f.segments.map( s => ({type: s.type, start: s.start})) : []
		return d
	})

	
	let fitted = []

	eko_data.forEach( rec => {
		fitted = fitted.concat( fitSegmentations({
			reference:{
				name: "EKO",
				data: rec.EKO_segments
			},
			segmentation:{
				name:"ST",
				data: rec.ST_segments
			}
		}))
	})

	// fitted.forEach( d => {
	// 	console.log( d.EKO_type, "\t", d.EKO_start, "\t", d.ST_type, "\t", d.ST_start )
	// })
	
	await saveXLSX(
		fitted,
		`${TEMP}/segmentation-ecg.xlsx`,
		"data"
	)

	// drive = await prepareFiles(`${ROOT}`)
	// console.log(`UPLOAD: ${TEMP}/segmentation-ecg.xlsx into ${PREPROCESS}`)
	// await drive.uploadFiles({
	// 	fs: [`${TEMP}/segmentation-ecg.xlsx`],
	// 	googleDrive:`${PREPROCESS}`
	// })

	// await unlink(`${TEMP}/heart_rate.xlsx`)
	
	
}

run()

