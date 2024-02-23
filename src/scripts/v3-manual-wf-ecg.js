const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate, groupBy, keys, isUndefined, last, first } = require("lodash")
const { loadJSON, unlink, writeFile, saveJSON } = require("../utils/file-system")
const { saveXLSX, loadXLSX } = require("../utils/xlsx")
const { avg, std, anomals } = require("../utils/stat")

const R = require('../utils/R');

const { fitSegmentations } = require("../utils/fit-segments")


const ST_JSON = "./data/v3/ai/v3pxecg-iph.json"
const ST_FW_JSON = "./data/structures/V3-AI-Validation-2024/WF/v3pxecg-iph-waveform.json"
const EKO_FW_JSON = "./data/structures/V3-AI-Validation-2024/WF/v3pxecg-ekocore-waveform.json"

const RESULT_JSON = "./data/structures/V3-AI-Validation-2024/10.2.1 Test 2.1. Validation of heart sounds timing by Stethophone in clinical environment/waveform-pool.json"
// const GD_ROOT = "V3-AI-Validation-2024/10.2.1 Test 2.1. Validation of heart sounds timing by Stethophone in clinical environment"

const getDrive = async path => {
	let googleDrive = await googledriveService.create(path)
	return googleDrive	 
}

const run = async () => {

	let st_data = loadJSON(ST_JSON)
	let st_wf = loadJSON(ST_FW_JSON)
	
	st_data = st_data.map( d => ({
		patientId: last(d.patient_id.split("-")),
		file: d.file_id
	}))
	
	let result = [] 
	
	st_data.forEach( d => {
		result.push ({
			device: "Stethophone",
			patientId: d.patientId,
			waveform: find(st_wf, wf => `${d.file}.wav` == wf.filename).waveform
		})
	})


	let eko_wf = loadJSON(EKO_FW_JSON)

	eko_wf.forEach( d => {
		result.push({
			device: "Eko CORE",
			patientId: d.filename.split("-")[4],
			waveform: d.waveform
		})
	})

	saveJSON(RESULT_JSON, result)

	
	// let drive = await getDrive(`${GD_ROOT}`)
	
	// console.log(`Upload to: ${GD_ROOT}/segments-pool.xlsx`)
	
	// await drive.uploadFiles({
	// 	fs: [RESULT_XLSX],
	// 	googleDrive: GD_ROOT
	// })

	
}

run()

