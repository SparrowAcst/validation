const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate, groupBy, keys, isUndefined, last, first } = require("lodash")
const { loadJSON, saveJSON, unlink, writeFile } = require("../utils/file-system")
const { saveXLSX, loadXLSX } = require("../utils/xlsx")
const { avg, std, anomals } = require("../utils/stat")



const ST_JSON = "./data/v3/ai/v3pxecg-iph.json"

const ST_WF_JSON = "./data/structures/V3-AI-Validation-2024/WF/v3pxecg-iph-waveform.json"
const EKO_WF_JSON = "./data/structures/V3-AI-Validation-2024/WF/v3pxecg-ekocore-waveform.json"


const RESULT_JSON = "./data/structures/V3-AI-Validation-2024/10.2.1 Test 2.1. Validation of heart sounds timing by Stethophone in clinical environment/waveforms.json"
const GD_ROOT = "V3-AI-Validation-2024/10.2.1 Test 2.1. Validation of heart sounds timing by Stethophone in clinical environment"

const getDrive = async path => {
	let googleDrive = await googledriveService.create(path)
	return googleDrive	 
}




const run = async () => {

	let st_metadata = loadJSON(ST_JSON)
	let st_wf = loadJSON(ST_WF_JSON)
	let eko_wf = loadJSON(EKO_WF_JSON)
	
	st_metadata = st_metadata.map( d => ({
		patientId: last(d.patient_id.split("-")),
		file: d.file_id
	}))
	
	let result = st_wf.map(d=> {
		d.metadata.device = "Stethophone",
		console.log(d.metadata.fileName)
		let f = find(st_metadata, s => {
				return `${s.file}.wav` == d.metadata.fileName
			})
		d.metadata.patientId = (f) ? f.patientId :  undefined
		return d
	})

	result = result.filter(d => d.metadata.patientId) 

	result = result.concat( 
		eko_wf.map(d => {
			d.metadata.device = "Eko CORE"
			d.metadata.patientId = d.metadata.fileName.split("-")[4]
			return d
		})
	)
	
	
	console.log(`Save ${RESULT_JSON}`)
	
	saveJSON(RESULT_JSON, result)

	let drive = await getDrive(`${GD_ROOT}`)
	
	console.log(`Upload to: ${GD_ROOT}/waveforms.json`)
	
	await drive.uploadFiles({
		fs: [RESULT_JSON],
		googleDrive: GD_ROOT
	})

	
}

run()

