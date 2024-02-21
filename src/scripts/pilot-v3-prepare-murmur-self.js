// table header
// tester	patient	qty	spot	murmur	murmurConf	hr	Heart rate estimation possiblity	hrConf	s1	I cannot answer about S1	s1Conf	s2	I cannot answer about S2	s2Conf


const googledriveService = require("../utils/google-drive")
const { loadXLSX, saveXLSX } = require("../utils/xlsx")
const { writeFile } = require("../utils/file-system")
const { find, keys, sortBy, extend, groupBy, isUndefined } = require("lodash")
const { loadJSON, unlink } = require("../utils/file-system")
const { avg, std, mode, anomals, sum } = require("../utils/stat")
const R = require('../utils/R')



const EXPERT_INPUT_XLSX = "./data/structures/V3-AI-Validation-2024/10.7 Test 7. Validation of informativeness of Stethophone’s heart sound analysis algorithm for recordings made by lay users/box 9.3.5-2.xlsx"
const ST_JSON = "./data/v3/ai/v3pxself.json"
const RES_XLSX = "./data/structures/V3-AI-Validation-2024/10.7 Test 7. Validation of informativeness of Stethophone’s heart sound analysis algorithm for recordings made by lay users/pilot-murmur-hr-.xlsx"

const GD_ROOT = "V3-AI-Validation-2024/10.7 Test 7. Validation of informativeness of Stethophone’s heart sound analysis algorithm for recordings made by lay users"

const getDrive = async path => {
	let googleDrive = await googledriveService.create(path)
	return googleDrive	 
}



const experts = [2,5,1]




const not = rule => ( row => !rule(row)) 
const andReducer = [(a,b) => a&&b, true]
const orReducer = [(a,b) => a||b, false]



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
		d.patient = `v3-ai-self-iph-p${p.toString().padStart(2, "0")}`
		d.tester = t
		// d.murmur = (d.murmur) ? "present" : "absent"
		// d.murmurConf =   
	})

	data = data.map( d => {
		d.record = `${d.patient}-${d.spot}`
		return d
	})

	data = data.filter( d => experts.includes(d.tester))

// 	data = groupBy(sortBy(data, row => row.tester), row => row.record)
// 	data = keys(data).map( key => extend({}, {
// 		id: key, 
// 		qty: data[key][0].qty,
// 		patient: data[key][0].patient,
// 		tester: data[key][0].tester,
// 		spot:data[key][0].spot, 
// 		data: data[key]
// 	}))


// ////////////////////////// murmur assessment //////////////////////////////////

// 	const murmurAssessmentRules = {
// 		rules: [
// 			row => {
// 				let a = row.data.filter( d => d.murmurConf == "confident")
				
// 				//TODO check exclusion rules
// 				if(a.length < 4) return

// 				let presents = a.filter( d => d.murmur == "present").length
// 				let absents = a.length - presents
// 				return ((presents - absents) == 0) ? undefined : ((presents - absents) > 0) ? "present" : "absent"
// 			},
// 		],
// 	}

// 	const s1AssessmentRules = {
// 		rules: [
// 			row => {
// 				let a = row.data.filter( d => d.s1Conf == "confident")
				
// 				//TODO check exclusion rules
// 				if(a.length < 4) return

// 				let presents = a.filter( d => d.s1 == "yes").length
// 				let absents = a.length - presents
// 				return ((presents - absents) == 0) ? undefined : ((presents - absents) > 0) ? "yes" : "no"
// 			},
// 		],
// 	}

// 	const s2AssessmentRules = {
// 		rules: [
// 			row => {
// 				let a = row.data.filter( d => d.s2Conf == "confident")
				
// 				//TODO check exclusion rules
// 				if(a.length < 4) return

// 				let presents = a.filter( d => d.s2 == "yes").length
// 				let absents = a.length - presents
// 				return ((presents - absents) == 0) ? undefined : ((presents - absents) > 0) ? "yes" : "no"
// 			},
// 		],
// 	} 

// 	const hrAssessmentRules = {
// 		rules: [
// 			row => {
// 				let a = row.data
// 						.filter( d => d.hrConf == "confident")
// 						.filter( d => !isUndefined(d.hr))
				
// 				//TODO check exclusion rules
// 				if(a.length < 4) return

// 				return Math.round(avg(a.map(d => d.hr)))	
// 			},
// 		],
// 	} 



// 	data
// 		.forEach( row => {
// 			row.murmurAssessment = applyRules(row, murmurAssessmentRules)
// 			row.murmurInclusion = (isUndefined(row.murmurAssessment)) ? "exclude" : "include"
		
// 			row.hrAssessment = applyRules(row, hrAssessmentRules)
		
// 			row.s1Assessment = applyRules(row, s1AssessmentRules)
// 			row.s1Inclusion = (isUndefined(row.s1Assessment)) ? "exclude" : "include"
		
// 			row.s2Assessment = applyRules(row, s2AssessmentRules)
// 			row.s2Inclusion = (isUndefined(row.s2Assessment)) ? "exclude" : "include"
// 		})

// //////////////////////////////////////////////////////////////////////////////////////////

// 	data = data.map( d => {
// 		let res = {
// 			id: d.id,
// 			patient: d.patient,
// 			spot: d.spot,
// 			qty: (d.qty) ? "bad" : "acceptable",
// 			murmurInclusion: d.murmurInclusion,
// 			murmurAssessment: d.murmurAssessment,
// 			hrAssessment: d.hrAssessment,
// 			s1Inclusion: d.s1Inclusion,
// 			s1Assessment: d.s1Assessment,
// 			s2Inclusion: d.s2Inclusion,
// 			s2Assessment: d.s2Assessment,
// 		}
		
// 		d.data.forEach((v, index) => {
			
// 			res["murmur_"+v.tester] = v.murmur
// 			res["confMurmur_"+v.tester] = v.murmurConf
			
// 			res["hr_"+v.tester] = v.hr
// 			res["confHR_"+v.tester] = v.hrConf
			
// 			res["s1_"+v.tester] = v.s1
// 			res["confS1_"+v.tester] = v.s1Conf
			
// 			res["s2_"+v.tester] = v.s2
// 			res["confS2_"+v.tester] = v.s2Conf
// 		})

// 		return res

// 	})


// 	data = sortBy(data, d => d.patient)

// 	let st_data = loadJSON(ST_JSON)



// 	data.forEach( row => {
		
// 		let f = find(st_data, s => {
// 			return (row.patient == s.patient_id) && (row.spot.toUpperCase().trim().split(" ").join("") == s.record_spot.toUpperCase())
// 		})
// 		row.murmurAI = (f) ? (f.has_murmur) ? "present" : "absent" : undefined
// 		row.qtyAI = (f) ? (f.is_fine) ? "acceptable" : "bad" : undefined
// 		row.hrAI = (f) ? f.heart_rate : undefined
// 	})


// 	let header = [
// 		"patient",
// 		"spot",
// 		"qty",
// 		"qtyAI",
// 		"murmur_1",
// 		"confMurmur_1",
// 		"murmur_2",
// 		"confMurmur_2",
// 		"murmur_3",
// 		"confMurmur_3",
// 		"murmur_4",
// 		"confMurmur_4",
// 		"murmur_5",
// 		"confMurmur_5",
// 		"murmur_6",
// 		"confMurmur_6",
// 		"murmurInclusion",
// 		"murmurAssessment",
// 		"murmurAI",
// 		"hr_1",
// 		"confHR_1",
// 		"hr_2",
// 		"confHR_2",
// 		"hr_3",
// 		"confHR_3",
// 		"hr_4",
// 		"confHR_4",
// 		"hr_5",
// 		"confHR_5",
// 		"hr_6",
// 		"confHR_6",
// 		"hrAssessment",
// 		"hrAI",
// 		"s1_1",
// 		"confS1_1",
// 		"s1_2",
// 		"confS1_2",
// 		"s1_3",
// 		"confS1_3",
// 		"s1_4",
// 		"confS1_4",
// 		"s1_5",
// 		"confS1_5",
// 		"s1_6",
// 		"confS1_6",
// 		"s1Inclusion",
// 		"s1Assessment",
// 		"s2_1",
// 		"confS2_1",
// 		"s2_2",
// 		"confS2_2",
// 		"s2_3",
// 		"confS2_3",
// 		"s2_4",
// 		"confS2_4",
// 		"s2_5",
// 		"confS2_5",
// 		"s2_6",
// 		"confS2_6",
// 		"s2Inclusion",
// 		"s2Assessment"
// 	]
	
	await saveXLSX(data, RES_XLSX, "data")

	// let drive = await getDrive(`${GD_ROOT}`)
	// console.log(`Upload to: ${GD_ROOT}/murmur-hr-assessments-lay-users.xlsx`)
	// await drive.uploadFiles({
	// 	fs: [RES_XLSX],
	// 	googleDrive: GD_ROOT
	// })




}

run()

