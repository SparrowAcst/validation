const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate, groupBy, keys, isUndefined, last, first } = require("lodash")
const { loadJSON, unlink, writeFile } = require("../utils/file-system")
const { saveXLSX, loadXLSX } = require("../utils/xlsx")
const { avg, std, anomals } = require("../utils/stat")

const R = require('../utils/R');

const { fitSegmentations } = require("../utils/fit-segments")


const ST_JSON = "./data/v3/ai/v3pxecg-iph.json"
const EKO_XLSX = "./data/structures/V3-AI-Validation-2024/10.2.1 Test 2.1. Validation of heart sounds timing by Stethophone in clinical environment/segments.xlsx"
const RESULT_XLSX = "./data/structures/V3-AI-Validation-2024/10.2.1 Test 2.1. Validation of heart sounds timing by Stethophone in clinical environment/segments-pool.xlsx"
const GD_ROOT = "V3-AI-Validation-2024/10.2.1 Test 2.1. Validation of heart sounds timing by Stethophone in clinical environment"

const getDrive = async path => {
	let googleDrive = await googledriveService.create(path)
	return googleDrive	 
}

const run = async () => {

	let st_data = loadJSON(ST_JSON)
	
	st_data = st_data.map( d => ({
		patientId: last(d.patient_id.split("-")),
		segments: d.segments,
		file: d.file_id
	}))
	
	let result = [] 
	
	st_data.forEach( d => {
		d.segments.forEach( s => {
			result.push ({
				device: "Stethophone",
				patientId: d.patientId,
				type: s.type,
				start: s.start,
				end: s.end,
				file: d.file
			})
		})
	})


	let eko_data = await loadXLSX(EKO_XLSX,"data")

	let p
	eko_data = eko_data.filter( d => !isUndefined(d.Start))
	eko_data.forEach( d => {
		p = (d["Recording ID"]) ? d["Recording ID"].split("-")[4] : p
		d.patientId = p 
		result.push({
			device: "Eko CORE",
			patientId: p,
			type: d.Segment,
			start: d.Start
		})
	})

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

