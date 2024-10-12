const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate, groupBy, keys, last, first, isUndefined, uniqBy } = require("lodash")
const { loadJSON, unlink } = require("../utils/file-system")
const { saveXLSX, loadXLSX } = require("../utils/xlsx")
const { avg, std, anomals } = require("../utils/stat")


const ST_JSON = "./data/v3/ai/v3pxrepeathr-iph.json"
const EKO_XLSX = "./data/structures/V3-AI-Validation-2024/10.5  Test 5. Validation of repeatability of heart rate calculation algorithm/R-R.xlsx"
const RESULT_XLSX = "./data/structures/V3-AI-Validation-2024/10.5  Test 5. Validation of repeatability of heart rate calculation algorithm/HR.xlsx"

const GD_ROOT = "V3-AI-Validation-2024/10.5  Test 5. Validation of repeatability of heart rate calculation algorithm"

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
	
	st_data = st_data.map( d => {
		
		d.patientId = `${d.patient_id.split("-")[4]}-${d.patient_id.split("-")[5].replace("part", "")}`
		d.createdAt = d.file_created_at
		return d
	
	})
	
	st_data = groupBy(st_data, d => d.patientId)
	
	let st_temp = []
	
	keys(st_data).forEach( key => {
	
		let records = sortBy(st_data[key], d => d.createdAt).map( (d, index) => {
			d.patientId = `${d.patientId}-${(index+1).toString().padStart(2 , '0')}`
			console.log(d.patientId)
			return d
		})
	
		st_temp = st_temp.concat(records)
	
	})

	st_data = st_temp



	st_data = st_data.map( d => ({
		patientId: d.patientId,
		ST_heartRate: d.heart_rate
	}))
	
	// console.log(st_data)



	let eko_data = await loadXLSX(EKO_XLSX,"data")

	let p

	eko_data.forEach( d => {
		p = (d["Recording ID"]) ? d["Recording ID"].split("-").slice(4).join("-") : p
		d.patientId = p 
		// console.log(d.patientId)
		d.R = Number.parseFloat(d.R)
	})

	// console.log( uniqBy(eko_data.map(d => d.patientId)) )
	// eko_data.forEach( d => {
	// 	d.patientId = d["Recording ID"].split("-")[4]
	// })

	if(!st_data || !eko_data) return
	
	let temp = groupBy( eko_data, d => d.patientId)
	let anomalies = []
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
		// console.log("EKO_heartRate", heartRate)
		
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
		d.spot = d.patientId.split("-")[0]
		console.log(d)
		return d
	})



	let header = [
		"patientId",
		"spot",
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

