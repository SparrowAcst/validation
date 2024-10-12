// table header
// tester	patient	qty	spot	murmur	murmurConf	hr	Heart rate estimation possiblity	hrConf	s1	I cannot answer about S1	s1Conf	s2	I cannot answer about S2	s2Conf


const googledriveService = require("../utils/google-drive")
const { loadXLSX, saveXLSX } = require("../utils/xlsx")
const { writeFile } = require("../utils/file-system")
const { find, keys, sortBy, extend, groupBy, isUndefined, isNumber, last, first } = require("lodash")
const { loadJSON, unlink } = require("../utils/file-system")
const { avg, std, mode, anomals, sum } = require("../utils/stat")
const R = require('../utils/R')



const EXPERT_INPUT_XLSX = "./data/structures/V3-AI-Validation-2024/10.7 Test 7. Validation of informativeness of Stethophone’s heart sound analysis algorithm for recordings made by lay users/box 9.3.5-2.xlsx"
const ST_JSON = "./data/v3/ai/v3pxself.json"
const RES_XLSX = "./data/structures/V3-AI-Validation-2024/10.7 Test 7. Validation of informativeness of Stethophone’s heart sound analysis algorithm for recordings made by lay users/HR-7-SEG.xlsx"

const GD_ROOT = "V3-AI-Validation-2024/10.7 Test 7. Validation of informativeness of Stethophone’s heart sound analysis algorithm for recordings made by lay users"

const getDrive = async path => {
	let googleDrive = await googledriveService.create(path)
	return googleDrive	 
}






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
		// console.log(p)
		d.patientId = p
		t = (d.tester) ? d.tester : t
		d.patient = `v3-ai-self-iph-p${p.toString().padStart(2, "0")}`
		d.tester = t
		// d.murmur = (d.murmur) ? "present" : "absent"  
	})

	data = data.map( d => {
		d.record = `${d.patient}-${d.spot}`
		return d
	})

	data = groupBy(sortBy(data, row => row.tester), row => row.record)
	data = keys(data).map( key => extend({}, {
		id: key, 
		qty: data[key][0].qty,
		patient: data[key][0].patient,
		tester: data[key][0].tester,
		spot:data[key][0].spot, 
		data: data[key]
	}))


////////////////////////// murmur assessment //////////////////////////////////

	// const murmurAssessmentRules = {
	// 	rules: [
	// 		row => {
	// 			let a = row.data.filter( d => d.confMurmur == "non confident")
				
	// 			//TODO check exclusion rules
	// 			// if(a.length > 3) return "non confident"

	// 			let presents = row.data.filter( d => d.murmur == "present").length
	// 			let absents = row.data.length - presents
	// 			return ((presents - absents) == 0) ? "non consistent" : ((presents - absents) > 0) ? "present" : "absent"
			

	// 			// let a = row.data //.filter( d => d.murmurConf == "confident")
				
	// 			// //TODO check exclusion rules
	// 			// if(a.length < 4) return

	// 			// let presents = a.filter( d => d.murmur == "present").length
	// 			// let absents = a.length - presents
	// 			// return ((presents - absents) == 0) ? undefined : ((presents - absents) > 0) ? "present" : "absent"
	// 		},
	// 	],
	// }

	// const s1AssessmentRules = {
	// 	rules: [
	// 		row => {
	// 			let a = row.data.filter( d => (d.s1Conf == "non confident") || isUndefined(d.s1) || d.s1 == "I cannot answer")
				
	// 			//TODO check exclusion rules
	// 			// if(a.length > 3) return "non confident"

	// 			let presents = row.data.filter( d => d.s1 == "yes").length
	// 			let absents = row.data.filter( d => d.s1 == "no").length
	// 			return ((presents - absents) == 0) ? "non consistent" : ((presents - absents) > 0) ? "yes" : "no"
	// 		},
	// 	],
	// }

	// const s2AssessmentRules = {
	// 	rules: [
	// 		row => {
	// 			let a = row.data.filter( d => (d.s2Conf == "non confident") || isUndefined(d.s2) || d.s2 == "I cannot answer")
				
	// 			//TODO check exclusion rules
	// 			// if(a.length > 3) return "non confident"

	// 			let presents = row.data.filter( d => d.s2 == "yes").length
	// 			let absents = row.data.filter( d => d.s2 == "no").length
	// 			return ((presents - absents) == 0) ? "non consistent" : ((presents - absents) > 0) ? "yes" : "no"
	// 		},
	// 	],
	// } 

	const hrAssessmentRules = {
		rules: [
			row => {
				let a = row.data
						//.filter( d => d.hrConf == "confident")
						.filter( d => isUndefined(d.hr) || d.hrConf == "non confident")
				
				//TODO check exclusion rules
				if(a.length > 3) return "non confident"

				a = row.data.filter( d => !isUndefined(d.hr))	
				return Math.round(avg(a.map(d => d.hr)))	
			},
		],
	} 



	data
		.forEach( row => {
		
			row.hrAssessment = applyRules(row, hrAssessmentRules)
			row.hrInclusion = (isUndefined(row.hrAssessment)) ? "exclude" : "include"
	
		})

//////////////////////////////////////////////////////////////////////////////////////////

	data = data.map( d => {
		let res = {
			patientId: d.id,
			patient: d.patient,
			spot: d.spot,
			qty: (d.qty) ? "bad" : "acceptable",
			hrAssessment: d.hrAssessment,
			hrInclusion: d.hrInclusion,
		}
		
		return res

	})


	data = sortBy(data, d => d.patient)

	let st_data = loadJSON(ST_JSON)



	data.forEach( row => {
		
		let f = find(st_data, s => {
			return (row.patient == s.patient_id) && (row.spot.toUpperCase().trim().split(" ").join("") == s.record_spot.toUpperCase())
		})
		
		row.st_hr = (f) ? f.heart_rate : undefined
		row.ref_hr = (row.qtyAI == "bad") ? "bad qty" : row.hrAssessment
		row.diff = row.ref_hr - row.st_hr 
		row.hrInclusion = (isNumber(row.ref_hr)) ? "include" :"exclude" 
		if(f){
			let unseg = f.segments.filter(s => s.type == "unsegmentable")
			let duration = unseg.map(s => s.end - s.start).reduce((a,b) => a+b, 0)
			let seg = sortBy( f.segments, s => s.start)
			// console.log(seg)
			row.type = (unseg.length) ? "unseg" : "seg"
			row.unseg_count = unseg.length
			row.unseg_duration =  duration
			if(seg.length){
				row.duration = last(seg).end - first(seg).start
			}	
		}
	})


	let header = [
		"patientId",
		"duration",
		"type",
		"unseg_count",
		"unseg_duration",
		"ref_hr",			
		"st_hr",
		"diff",
	]
	
	data = data.filter( d => d.hrInclusion == "include")

	await saveXLSX(data, RES_XLSX, "data", header)




}

run()

