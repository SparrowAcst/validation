const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate, groupBy, keys } = require("lodash")
const { loadJSON, unlink } = require("../utils/file-system")
const { saveXLSX, loadXLSX } = require("../utils/xlsx")
const { avg, std, anomals } = require("../utils/stat")

const { fitSegmentations } = require("../utils/fit-segments")

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

	// let drive = await prepareFiles(ROOT)

	// let file = drive.fileList(ST_RECORDS)[0]
	
	let eko_data
	let st_data

	// if(file){
	// 	console.log("Download", file.path)	
	// 	await drive.downloadFiles({
	// 		fs: TEMP,
	// 		googleDrive: [file]
	// 	})
	// 	await delay(1000)
	// 	console.log("Load JSON", `${TEMP}/${file.name}`)	
	

	st_data = loadJSON(`${TEMP}/v3p__repeathr.json`) 

		// try {
		// 	st_data = loadJSON(`${TEMP}/${file.name}`)
		// } catch (e) {
		// 	st_data = loadJSON(`${TEMP}/${file.name}`)
		// }
	// }

	// file = drive.fileList(EKO_RECORDS)[0]
	
	// if(file){
	// 	console.log("Download", file.path)	
	// 	await drive.downloadFiles({
	// 		fs: TEMP,
	// 		googleDrive: [file]
	// 	})
	// 	await delay(1000)
	// 	console.log("Load XLSX", `${TEMP}/${file.name}`)	
		
		// eko_data = await loadXLSX(
		// 	`${TEMP}/${file.name}`,
		// 	"data"
		// )
	// }

	eko_data = await loadXLSX(
			`${TEMP}/segments (2).xlsx`,
			"data"
		)

	
	let rMap = await loadXLSX(
        `${TEMP}/record matching.xlsx`,
        "data"
    )

	eko_data = eko_data.map( d => {
		let f = find(rMap, r => r["Recording ID"] == d["Recording ID"])
		d.fileId = f['Stetophone file ID']
		return d	
	})
	
	
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
			fileId: temp[key][0].fileId,
			EKO_segments: t.map( d => ({type: d.Segment.trim(), start: d.Start}))
		}

	})

	eko_data.forEach( d => {
		for(let i=0; i<d.EKO_segments.length-1; i++){
			if(d.EKO_segments[i].start >= d.EKO_segments[i+1].start){
				console.log("ERROR", d.recordId, d.EKO_segments[i].start, " > " ,d.EKO_segments[i+1].start)
			}
		}
	})


	eko_data = eko_data.map( d => {
		let f = st_data.filter(t => t.file_id == d.fileId)[0]
		d.ST_segments = (f) ? f.segments.map( s => ({type: s.type.trim(), start: s.start, end: s.end})) : []
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
		}).map( d => {
			d.recordId = rec.recordId
			return d
		}))
	})

	await saveXLSX(
		fitted,
		`${TEMP}/segmentation-repeathr.xlsx`,
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

