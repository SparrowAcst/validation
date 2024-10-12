const { extend, sortBy, find, truncate, groupBy, keys, isUndefined, last, first } = require("lodash")
const { loadJSON, unlink, writeFile } = require("../utils/file-system")
const { saveXLSX, loadXLSX } = require("../utils/xlsx")
const { avg, std, anomals } = require("../utils/stat")

const ST_JSON = "./data/v3/ai/v3pxecg-iph.json"
const DATA_XLSX = "./data/structures/V3-AI-Validation-2024/10.2.1 Test 2.1. Validation of heart sounds timing by Stethophone in clinical environment/segments.xlsx"
const RESULT_XLSX = "./data/structures/V3-AI-Validation-2024/10.2.1 Test 2.1. Validation of heart sounds timing by Stethophone in clinical environment/segments-ecg-processed.xlsx"

const run = async () => {

	let st_data = loadJSON(ST_JSON)
	
	st_data = st_data.map( d => ({
		patientId: last(d.patient_id.split("-")),
		spot: d.record_spot,
		segments: d.segments
	}))
	
	let sync_data = await loadXLSX(DATA_XLSX, "sync")

	sync_data = sync_data.map( d => {
		let f = find( st_data, s => s.patientId == d.patient)
		if(f){
			d.spot = f.spot
		} else {
			console.log("No found", d.patient)
		}
		return d
	})
	
	await saveXLSX( sync_data, RESULT_XLSX, "data" )
	
}

run()

