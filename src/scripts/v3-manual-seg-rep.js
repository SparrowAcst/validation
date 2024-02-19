const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate, groupBy, keys, isUndefined, last, first } = require("lodash")
const { loadJSON, unlink, writeFile } = require("../utils/file-system")
const { saveXLSX, loadXLSX } = require("../utils/xlsx")
const { avg, std, anomals } = require("../utils/stat")

const R = require('../utils/R');

const { fitSegmentations } = require("../utils/fit-segments")


const ST_JSON = "./data/v3/ai/v3pxrepeathr-iph.json"
const EKO_XLSX = "./data/structures/V3-AI-Validation-2024/10.6  Test 6. Validation of repeatability of heart sounds timing algorithm/segments.xlsx"
const RESULT_XLSX = "./data/structures/V3-AI-Validation-2024/10.6  Test 6. Validation of repeatability of heart sounds timing algorithm/segments-pool.xlsx"
const GD_ROOT = "V3-AI-Validation-2024/10.6  Test 6. Validation of repeatability of heart sounds timing algorithm"

const getDrive = async path => {
	let googleDrive = await googledriveService.create(path)
	return googleDrive	 
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
			return d
		})
	
		st_temp = st_temp.concat(records)
	
	})

	st_data = st_temp

	let result = [] 
	
	st_data.forEach( d => {
		d.segments.forEach( s => {
			result.push ({
				device: "Stethophone",
				patientId: d.patientId,
				type: s.type,
				start: s.start,
				end: s.end,
				file: d.file_id
			})
		})
	})

	// console.log(st_data.slice(0,3))

	let eko_data = await loadXLSX(EKO_XLSX,"data")

	let p
	eko_data = eko_data.filter( d => !isUndefined(d.start))
	eko_data.forEach( d => {
		p = (d["recording id"]) ? d["recording id"].split("-").slice(4).join("-") : p
		d.patientId = p 
		result.push({
			device: "Eko CORE",
			patientId: p,
			type: d.segments,
			start: d.start
		})
	})

	// console.log(eko_data)

	console.log(`Save ${RESULT_XLSX}`)
	
	await saveXLSX( result, RESULT_XLSX, "data" )

	let drive = await getDrive(`${GD_ROOT}`)
	
	console.log(`Upload to: ${GD_ROOT}/segments-pool.xlsx`)
	
	await drive.uploadFiles({
		fs: [RESULT_XLSX],
		googleDrive: GD_ROOT
	})

	
}

run()

