const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate, groupBy, keys, last, first } = require("lodash")
const { loadJSON, unlink } = require("../utils/file-system")
const { saveXLSX, loadXLSX } = require("../utils/xlsx")
const { avg, std, anomals } = require("../utils/stat")


const ST_JSON = "./data/v3/ai/v3pxecg-iph.json"
const EKO_XLSX = "./data/structures/V3-AI-Validation-2024/10.3.1 Test 3.1. Accuracy of HR calculation by Stethophone in clinical environment/R-R.xlsx"
const RESULT_XLSX = "./data/structures/V3-AI-Validation-2024/10.3.1 Test 3.1. Accuracy of HR calculation by Stethophone in clinical environment/HR.xlsx"

const GD_ROOT = "V3-AI-Validation-2024/10.3.1 Test 3.1. Accuracy of HR calculation by Stethophone in clinical environment"

const getDrive = async path => {
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

	let st_data = loadJSON(ST_JSON)
	
	st_data = st_data.map( d => ({
		patientId: last(d.patient_id.split("-")),
		ST_heartRate: d.heart_rate
	}))
	
	let eko_data = await loadXLSX(EKO_XLSX,"data")

	let p

	eko_data.forEach( d => {
		p = (d["Recording ID"]) ? d["Recording ID"].split("-")[4] : p
		d.patientId = p 
		d.R = Number.parseFloat(d.R)
	})

	if(!st_data || !eko_data) return
	
	let temp = groupBy( eko_data, d => d.patientId)
	
	eko_data = keys(temp).map( key => {
		
		let t = sortBy(temp[key], d => d["Cardio Cicle"]).map( d => d.R)
		console.log(key, t)
		let anomals = checkIntervals(t)
		if(anomals.length > 0){
			anomals = anomals.map( (data, index) => {
				data.recording = key
				data.cardioCicle = data.index+1
				data.start = t[data.index] 
				data.duration = data.value
				// data.form = EKO_RECORDS
				delete data.value
				delete data.index
				return data
			})
			console.log("ANOMALIES:", anomals)
		}
		
		let c = []
		for(let i=0; i < t.length-1; i++){
			c.push( 60 /(t[i+1] - t[i]) )
		}
		
		let heartRate = Number.parseInt((c.reduce((a,b) => a+b) / c.length).toFixed(0))
		console.log("heartRate", heartRate)
		return {
			patientId: key,
			EKO_heartRate: heartRate,
			anomalies: JSON.stringify(anomals, null, " ")
		}

	})

		
	result = st_data.concat(eko_data)
	let g = groupBy(result, d => d.patientId)
	result = keys(g).map( key => extend({}, g[key][0], g[key][1]) )
	
	result = result.map( d => {
		d.difference = Math.abs(d.EKO_heartRate - d.ST_heartRate)
		return d
	})

	let header = [
		"patientId",
		"EKO_heartRate",			
		"ST_heartRate",
		"difference",
		"anomalies"
	]


	await saveXLSX(	sortBy(result, d => d.patientId), RESULT_XLSX, "data", header)

	let drive = await getDrive(`${GD_ROOT}`)
	console.log(`Upload to: ${GD_ROOT}/HR.xlsx`)
	await drive.uploadFiles({
		fs: [RESULT_XLSX],
		googleDrive: GD_ROOT
	})
	
}

run()

