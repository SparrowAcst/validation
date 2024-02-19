const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate, groupBy, keys, isUndefined, last, first } = require("lodash")
const { loadJSON, unlink, writeFile } = require("../utils/file-system")
const { saveXLSX, loadXLSX } = require("../utils/xlsx")
const { avg, std, anomals } = require("../utils/stat")

const R = require('../utils/R');

const { fitSegmentations } = require("../utils/fit-segments")


const ST_JSON = "./data/v3/ai/v3pxecg-iph.json"
const EKO_XLSX = "./data/structures/V3-AI-Validation-2024/10.2.1 Test 2.1. Validation of heart sounds timing by Stethophone in clinical environment/segments.xlsx"
const RESULT_XLSX = "./data/structures/V3-AI-Validation-2024/10.2.1 Test 2.1. Validation of heart sounds timing by Stethophone in clinical environment/fit-seg.xlsx"
const PLOT = "./data/structures/V3-AI-Validation-2024/10.2.1 Test 2.1. Validation of heart sounds timing by Stethophone in clinical environment/blade-altman.png"
const TEXT = "./data/structures/V3-AI-Validation-2024/10.2.1 Test 2.1. Validation of heart sounds timing by Stethophone in clinical environment/blade-altman.txt"


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

	let st_data = loadJSON(ST_JSON)
	
	st_data = st_data.map( d => ({
		patientId: last(d.patient_id.split("-")),
		segments: d.segments
	}))
	
	let eko_data = await loadXLSX(EKO_XLSX,"data")

	let p
	eko_data = eko_data.filter( d => !isUndefined(d.Start))
	eko_data.forEach( d => {
		p = (d["Recording ID"]) ? d["Recording ID"].split("-")[4] : p
		d.patientId = p 
	})

			
	if(!st_data || !eko_data) return
	
	let temp = groupBy( eko_data, d => d.patientId)
	
	eko_data = keys(temp).map( key => {
		
		let t = sortBy(temp[key], d => d.start)
		let anomals = checkIntervals(t.filter(d => d.Segment == "s1").map(d => d.Start))
		if(anomals.length > 0){
			anomals = anomals.map( (data, index) => {
				data.recording = key
				data.timeIndex = data.index+1
				data.start = t[data.index] 
				// data.form = EKO_RECORDS
				delete data.value
				delete data.index
				return data
			})
			console.log("ANOMALIES S1:", anomals)
		}
		
		anomals = checkIntervals(t.filter(d => d.Segment == "s2").map(d => d.Start))
		if(anomals.length > 0){
			anomals = anomals.map( (data, index) => {
				data.recording = key
				data.timeIndex = data.index+1
				data.start = t[data.index] 
				// data.form = EKO_RECORDS
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
		let f = find(st_data, t => t.patientId == d.recordId)
		d.ST_segments = (f) ? f.segments.map( s => ({type: s.type, start: s.start})) : []
		return d
	})


	let fitted = []

	eko_data.forEach( (rec, index) => {
		// if(index > 0) return
		console.log(rec.recordId)
		let res = fitSegmentations({
			reference:{
				name: "EKO",
				data: rec.EKO_segments
			},
			segmentation:{
				name:"ST",
				data: rec.ST_segments
			}
		})
		res.forEach( d => d.recordId = rec.recordId)
		fitted = fitted.concat(res)
	})

	
	await saveXLSX( fitted, RESULT_XLSX, "data" )


	let x = fitted.map(d => d.EKO_fit)
	let y = fitted.map(d => d.ST_fit)
	
	let result = await R.call("./src/R/bland-altman.r", "execute", {
		plot: PLOT,
		x,
		y,
		level: 0.8,
		delta: 0.15
	})

	writeFile(TEXT, result.join("\n"))




	// drive = await prepareFiles(`${ROOT}`)
	// console.log(`UPLOAD: ${TEMP}/segmentation-ecg.xlsx into ${PREPROCESS}`)
	// await drive.uploadFiles({
	// 	fs: [`${TEMP}/segmentation-ecg.xlsx`],
	// 	googleDrive:`${PREPROCESS}`
	// })

	// await unlink(`${TEMP}/heart_rate.xlsx`)
	
	
}

run()

