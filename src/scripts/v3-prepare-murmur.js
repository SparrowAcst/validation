// Table header
//  tester	patient	spot	Insufficient quality, the file was not assessed 	The murmur is absent 	murmur	confMurmur

const googledriveService = require("../utils/google-drive")
const { loadXLSX, saveXLSX } = require("../utils/xlsx")
const { writeFile } = require("../utils/file-system")
const { find, keys, sortBy, extend, groupBy, isUndefined } = require("lodash")
const { loadJSON, unlink } = require("../utils/file-system")
const { avg, std, mode, anomals, sum } = require("../utils/stat")
const R = require('../utils/R')

const EXPERT_INPUT_XLSX = "./data/structures/V3-AI-Validation-2024/10.1.1 Test 1.1. Assessment of accuracy of heart murmur detection by Stethophone in clinical environment/Box 9.3.5.1-1.xlsx"
const ST_JSON = "./data/v3/ai/v3pxdr.json"
const RES_XLSX = "./data/structures/V3-AI-Validation-2024/10.1.1 Test 1.1. Assessment of accuracy of heart murmur detection by Stethophone in clinical environment/murmur-assessments.xlsx"

const GD_ROOT = "V3-AI-Validation-2024/10.1.1 Test 1.1. Assessment of accuracy of heart murmur detection by Stethophone in clinical environment"

const getDrive = async path => {
	let googleDrive = await googledriveService.create(path)
	return googleDrive	 
}

const not = rule => ( row => !rule(row)) 
const andReducer = [(a,b) => a&&b, true]
const orReducer = [(a,b) => a||b, false]

const rulesForAdvancedExpert = {
	rules: [
		row => row.data[0].murmur != row.data[1].murmur,
		row => row.data[0].confMurmur == row.data[1].confMurmur && row.data[0].confMurmur == "non confident",
		row => row.data[0].confMurmur == "non confident" || row.data[1].confMurmur == "non confident",
		
		row => Math.abs(row.data[0].hr - row.data[1].hr) > 10,
		row => row.data[0].confHr == row.data[1].confHr && row.data[0].confHr == "non confident",
		row => row.data[0].confHr == "non confident" || row.data[1].confHr == "non confident",

		row => row.data[0].s1 != row.data[1].s1,
		row => row.data[0].confS1S2 == row.data[1].confS1S2 && row.data[0].confS1S2 == "non confident",
		row => row.data[0].confS1S2 == "non confident" || row.data[1].confS1S2 == "non confident",
		
		row => row.data[0].s2 != row.data[1].s2,
		row => row.data[0].confS1S2 == row.data[1].confS1S2 && row.data[0].confS1S2 == "non confident",
		row => row.data[0].confS1S2 == "non confident" || row.data[1].confS1S2 == "non confident",
		
	],
	reducer: orReducer
}	


const applyRules = (row, rules) => {
	let res = rules.rules.map( rule => rule(row))
	if(rules.reducer){
		return res.reduce(...rules.reducer)	
	} else {
		return res[0]
	}
}


const run = async () => {

	let	data = await loadXLSX(EXPERT_INPUT_XLSX, "data")

	let t,p

	data.forEach( d => {
		p = (d.patient) ? d.patient : p
		d.patientId = p
		t = (d.tester) ? d.tester : t
		d.patient = `v3-ai-dr-iph-p${p.toString().padStart(2, "0")}`
		d.tester = t
		d.murmur = (d.murmur) ? "present" : "absent"  
	})

	data = data.map( d => {
		d.record = `${d.patient}-${d.spot}`
		return d
	})

	data = groupBy(sortBy(data, row => row.tester), row => row.record)
	data = keys(data).map( key => extend({}, {
		id: key, 
		patient:data[key][0].patient, 
		spot:data[key][0].spot, 
		data: data[key]
	}))


////////////////////////// murmur assessment //////////////////////////////////

	const murmurAssessmentRules = {
		rules: [
			row => {
				let a = row.data.filter( d => d.confMurmur == "confident")
				
				//TODO check exclusion rules
				if(a.length < 4) return

				let presents = a.filter( d => d.murmur == "present").length
				let absents = a.length - presents
				return ((presents - absents) == 0) ? undefined : ((presents - absents) > 0) ? "present" : "absent"
			},
		],
	} 

	data
		// .filter( d => d.murmurInclusion)
		.forEach( row => {
			row.murmurAssessment = applyRules(row, murmurAssessmentRules)

			row.murmurInclusion = (isUndefined(row.murmurAssessment)) ? "exclude" : "include"
			// return row
		})


//////////////////////////////////////////////////////////////////////////////////////////

	data = data.map( d => {
		let res = {
			id: d.id,
			patient: d.patient,
			spot: d.spot,
			murmurInclusion: d.murmurInclusion,
			murmurAssessment: d.murmurAssessment,
		}
		
		d.data.forEach((v, index) => {
			res["murmur_"+v.tester] = v.murmur
			res["confMurmur_"+v.tester] = v.confMurmur
			
		})

		return res

	})

	data = sortBy(data, d => d.patient)

	let st_data = loadJSON(ST_JSON)


	data.forEach( row => {
		
		let f = find(st_data, s => {
			return (row.patient == s.patient_id) && (row.spot.toUpperCase().trim().split(" ").join("") == s.record_spot.toUpperCase())
		})

		row.murmurAI = (f) ? (f.has_murmur) ? "present" : "absent" : undefined
		row.qtyAI = (f) ? (f.is_fine) ? "acceptable" : "bad" : undefined
	
	})


	let header = [
		"patient",
		"spot",
		"qtyAI",
		"murmur_1",
		"confMurmur_1",
		"murmur_2",
		"confMurmur_2",
		"murmur_3",
		"confMurmur_3",
		"murmur_4",
		"confMurmur_4",
		"murmur_5",
		"confMurmur_5",
		"murmur_6",
		"confMurmur_6",
		"murmurInclusion",
		"murmurAssessment",
		"murmurAI"
	]



	await saveXLSX(data, RES_XLSX, "data", header)

	let drive = await getDrive(`${GD_ROOT}`)
	console.log(`Upload to: ${GD_ROOT}/murmur-assessments.xlsx`)
	await drive.uploadFiles({
		fs: [RES_XLSX],
		googleDrive: GD_ROOT
	})


}

run()

