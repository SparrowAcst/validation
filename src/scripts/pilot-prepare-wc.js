// header

// expert	patient	spot	murmur	confMurmur	hr	Heart rate estimation possiblity	confHr	I cannot answer about S1	confS1	s2	I cannot answer about S2	confS2	patientId	record	s1	qty



const googledriveService = require("../utils/google-drive")
const { loadXLSX, saveXLSX } = require("../utils/xlsx")
const { writeFile } = require("../utils/file-system")
const { find, keys, sortBy, extend, groupBy, isUndefined } = require("lodash")
const { loadJSON, unlink } = require("../utils/file-system")
const { avg, std, mode, anomals, sum, max } = require("../utils/stat")
const R = require('../utils/R')


const EXPERT_INPUT_XLSX = "./data/structures/V3-AI-Validation-2024/10.7 Test 7. Validation of informativeness of Stethophone’s heart sound analysis algorithm for recordings made by lay users/pilot-murmur-hr-.xlsx"
const ST_JSON = "./data/v3/ai/v3pxself.json"
const RES_XLSX = "./data/structures/V3-AI-Validation-2024/10.7 Test 7. Validation of informativeness of Stethophone’s heart sound analysis algorithm for recordings made by lay users/pilot-murmur-hr-res-wc.xlsx"




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


const experts = [2,5,1]


const applyRules = (row, rules) => {
	let res = rules.rules.map( rule => rule(row))
	if(rules.reducer){
		return res.reduce(...rules.reducer)	
	} else {
		return res[0]
	}
}


const run = async () => {

	let	data = await loadXLSX(
			EXPERT_INPUT_XLSX,
			"data"
	)

	data = groupBy(sortBy(data, row => row.expert), row => row.record)
	data = keys(data).map( key => extend({}, {
		id: key, 
		patient:data[key][0].patient, 
		spot:data[key][0].spot, 
		data: groupBy(data[key], d => d.expert)
	}))

	data.forEach(d => {
		keys(d.data).forEach( k => {
			d.data[k] = d.data[k][0] 
		})
	})
	

	// console.log(JSON.stringify(data, null, " "))

////////////////////////// need advanced expert ///////////////////////////

	const rulesForAdvancedExpertMurmur = {
		rules: [
			
			// row => 
			// 		(row.data[experts[0]].confMurmur == "non confident") 
			// 	|| 	(row.data[experts[1]].confMurmur == "non confident"),

			row => 
				// 	(row.data[experts[0]].confMurmur == "confident") 
				// && 	(row.data[experts[1]].confMurmur == "confident")
				(row.data[experts[1]].murmur != row.data[experts[0]].murmur),
			
			row => 	!row.data[experts[1]].murmur ||	!row.data[experts[2]].murmur
		
		],

		reducer: orReducer
	}

	const rulesForAdvancedExpertHR = {
		rules: [
			
			row => Math.abs(row.data[experts[0]].hr - row.data[experts[1]].hr) > 10,
			// row => (row.data[experts[0]].confHr == row.data[experts[1]].confHr) && (row.data[experts[0]].confHr == "non confident"),
			// row => (row.data[experts[0]].confHr == "non confident") || (row.data[experts[1]].confHr == "non confident"),
			row => (!row.data[experts[0]].hr) || (!row.data[experts[1]].hr),

		],

		reducer: orReducer
	}	

	const rulesForAdvancedExpertS1 = {
		rules: [
			
			// row => 
			// 		(row.data[experts[0]].confS1 == "non confident") 
			// 	|| 	(row.data[experts[1]].confS1 == "non confident"),

			row => 
				// 	(row.data[experts[0]].confS1 == "confident") 
				// && 	(row.data[experts[1]].confS1 == "confident")
					(row.data[experts[1]].s1 != row.data[experts[0]].s1),
			
			row => 
					(!row.data[experts[0]].s1)
				|| 	(!row.data[experts[1]].s1)
				
			
		],

		reducer: orReducer
	}	

	const rulesForAdvancedExpertS2 = {
		rules: [
			
			// row => 
			// 		(row.data[experts[0]].confS2 == "non confident") 
			// 	|| 	(row.data[experts[1]].confS2 == "non confident"),

			row => 
				// 	(row.data[experts[0]].confS2 == "confident") 
				// && 	(row.data[experts[1]].confS2 == "confident")
				 	(row.data[experts[1]].s2 != row.data[experts[0]].s2),

			row => 
					(!row.data[experts[0]].s2)
				|| 	(!row.data[experts[1]].s2)
			
			
		],

		reducer: orReducer
	}
	

	data = data
		.filter(row => {
			// console.log(!isUndefined(row.data["0"]) && !isUndefined(row.data["1"]), row.data['0'])
			return !isUndefined(row.data[experts[0]]) && !isUndefined(row.data[experts[1]])
		})
		.map( row => {
			row.need3stExpertMurmur = applyRules(row, rulesForAdvancedExpertMurmur)
			row.need3stExpertHR = applyRules(row, rulesForAdvancedExpertHR)
			row.need3stExpertS1 = applyRules(row, rulesForAdvancedExpertS1)
			row.need3stExpertS2 = applyRules(row, rulesForAdvancedExpertS2)

			return row
		})
		.map( row => {
			if(!(row.need3stExpertMurmur || row.need3stExpertHR || row.need3stExpertS1 || row.need3stExpertS2)){
				row.data = [row.data[experts[0]],row.data[experts[1]]]
			} else {
				row.data = [row.data[experts[0]],row.data[experts[1]],row.data[experts[2]]]
			}
			return row
		})
		// .map( row => {
		// 	if(!(row.need3stExpertMurmur || row.need3stExpertHR || row.need3stExpertS1 || row.need3stExpertS2)){
		// 		row.data.pop()
		// 	}
		// 	return row
		// })

////////////////////////// inclusion in murmur analysis //////////////////////////////////

	const murmurExclusionRules = {
		rules: [
			row => {
				return row.data.filter( d => d.confMurmur == "non confident").length > 1
			}	
		]
	} 

	data = data.map( row => {
		row.murmurInclusion = !applyRules(row, murmurExclusionRules)
		return row
	})


	const hrExclusionRules = {
		rules: [
			row => {
				return row.data.filter( d => d.confHr == "non confident").length > 1
			},

			row => {
				return row.data.filter( d => isUndefined(d.hr)).length > 1
			},
			
			row => {
				let diffs = []
				for(let i=0; i< row.data.length-1; i++){
					for(let j=i+1; j<row.data.length; j++){
						diffs.push(Math.abs(row.data[i].hr - row.data[j].hr))
					}
				}
				return max(diffs) > 15
			},
			
			row => {
				let a = row.data.filter(d => d.confHr == "confident")
				let pool = a.map( d => d.hr).filter(d => !isUndefined(d))
				return pool.length < 2				
			}

		],
		reducer: orReducer
	} 

	data = data.map( row => {
		row.hrInclusion = !applyRules(row, hrExclusionRules)
		return row
	})

	const s1ExclusionRules = {
		rules: [
			row => {
				return row.data.filter( d => d.confS1 == "non confident").length > 1
			},
			row => {
				return row.data.filter( d => d.s1 == "cannot answer").length > 1
			}
		],
		reducer: orReducer
	} 

	data = data.map( row => {
		row.s1Inclusion = !applyRules(row, s1ExclusionRules)
		return row
	})

	const s2ExclusionRules = {
		rules: [
			row => {
				return row.data.filter( d => d.confS2 == "non confident").length > 1
			},
			row => {
				return row.data.filter( d => d.s2 == "cannot answer").length > 1
			}
		],
		reducer: orReducer
	} 

	data = data.map( row => {
		row.s2Inclusion = !applyRules(row, s2ExclusionRules)
		return row
	})


//////////////////////////////////////////////////////////////////////////////////////////

////////////////////////// murmur assessment //////////////////////////////////

	const murmurAssessmentRules = {
		rules: [
			row => {
				let a = row.data.filter( d => d.murmur)
				if(a.length < 2) return
				let presents = a.filter( d => d.murmur == "present").length
				let absents = a.length - presents
				return ((presents - absents) == 0) ? undefined : ((presents - absents) > 0)? "present" : "absent"
			},
		],
	} 

	data
		.forEach( row => {
			row.murmurAssessment = applyRules(row, murmurAssessmentRules)
		})

	const hrAssessmentRules = {
		rules: [
			row => {
				let a = row.data 

				let pool = a.map( d => d.hr).filter(d => d)
				if (pool.length <2) return
				return Math.round(avg(pool))
					
			},
		],
	} 

	data
		.forEach( row => {
			row.hrAssessment = applyRules(row, hrAssessmentRules)
			row.hrInclusion = (isUndefined(row.hrAssessment)) ? "exclude" : "include"
		})

	const s1AssessmentRules = {
		rules: [
			row => {
				// console.log(row.id, row.data.map( d => d.s1), row.data.map( d => d.confS1))
				let a = row.data.filter(d => d.s1) //&& d.s1 != "cannot answer")
				// console.log(a.map( d => d.s1))
			
				if(a.length < 2) return
					
				let presents = a.filter( d => d.s1 == "yes").length
				let absents = a.length - presents
				return ((presents - absents) == 0) ? undefined : ((presents - absents) > 0) ? "yes" : "no"	
				
			},

		],
	} 

	data
		// .filter( d => d.s1Inclusion)
		.forEach( row => {
			row.s1Assessment = applyRules(row, s1AssessmentRules)
		})
	
	const s2AssessmentRules = {
		rules: [
			row => {
				let a = row.data.filter(d => d.s2) //&& d.s1 != "cannot answer")
				
				if(a.length < 2) return
					
				let presents = a.filter( d => d.s2 == "yes").length
				let absents = a.length - presents
				return ((presents - absents) == 0) ? undefined : ((presents - absents) > 0) ? "yes" : "no"	
							
			},

		],
	} 

	data
		// .filter( d => d.s1Inclusion)
		.forEach( row => {
			row.s2Assessment = applyRules(row, s2AssessmentRules)
		})
		

//////////////////////////////////////////////////////////////////////////////////////////

	data = data.map( d => {
		let res = {
			id: d.id,
			patient: d.patient,
			spot: d.spot,
			needExperts: (d.need3stExpertMurmur || d.need3stExpertHR || d.need3stExpertS1 || d.need3stExpertS2) ? 3 : 2,
			nMr: d.need3stExpertMurmur ? 1 : undefined,
			nHR: d.need3stExpertHR ? 1 : undefined,
			nS1: d.need3stExpertS1 ? 1 : undefined,
			nS2: d.need3stExpertS2 ? 1 : undefined,
			

			murmurInclusion: (d.murmurAssessment) ? "include" : "exclude",
			murmurAssessment: d.murmurAssessment,
			murmur_1: d.data[0].murmur,
			// confMurmur_1: d.data[0].confMurmur,
			murmur_2: d.data[1].murmur,
			// confMurmur_2: d.data[1].confMurmur,
			murmur_3: (d.need3stExpertMurmur) ? d.data[2].murmur : undefined,
			// confMurmur_3: (d.need3stExpertMurmur) ? d.data[2].confMurmur: undefined,
		
			hrInclusion: (d.hrAssessment) ? "include" : "exclude",
			hr_1: d.data[0].hr,
			// confHR_1: d.data[0].confHr,
			hr_2: d.data[1].hr,
			// confHR_2: d.data[1].confHr,
			hr_3: (d.data[2] && d.need3stExpertHR) ? d.data[2].hr : undefined,
			// confHR_3: (d.data[2] && d.need3stExpertHR) ? d.data[2].confHr : undefined,
			hrAssessment: d.hrAssessment,

			s1Inclusion: (d.s1Assessment) ? "include" : "exclude",
			s1_1: d.data[0].s1,
			// confS1_1: d.data[0].confS1,
			s1_2: d.data[1].s1,
			// confS1_2: d.data[1].confS1,
			s1_3: (d.data[2] && d.need3stExpertS1) ? d.data[2].s1 : undefined,
			// confS1_3: (d.data[2] && d.need3stExpertS1) ? d.data[2].confS1: undefined,
			s1Assessment: d.s1Assessment,


			s2Inclusion: (d.s2Assessment) ? "include" : "exclude",
			s2_1: d.data[0].s2,
			// confS2_1: d.data[0].confS2,
			s2_2: d.data[1].s2,
			// confS2_2: d.data[1].confS2,
			s2_3: (d.data[2] && d.need3stExpertS2) ? d.data[2].s2 : undefined,
			// confS2_3: (d.data[2] && d.need3stExpertS2) ? d.data[2].confS2 : undefined,
			s2Assessment: d.s2Assessment,

		}
		return res

	})


	let st_data =  loadJSON(ST_JSON)


	data.forEach( row => {
		let f = find(st_data, s => (s.patient_id == row.patient) && (s.record_spot == row.spot))
		row.murmurAI = (f) ? (f.has_murmur) ? "present" : "absent" : undefined
		row.hrAI = (f) ? f.heart_rate : undefined
		row.qtyAI = (f) ? (f.is_fine) ? "acceptable" : "bad" : undefined
		if(!row.qtyAI || (row.qtyAI == "bad")) {
			row.murmurInclusion = "exclude"
			row.hrInclusion = "exclude"
			row.s1Inclusion = "exclude"
			row.s2Inclusion = "exclude"
		}	
	})


	// data = data.map( d => {
	// 	let res = {
	// 		id: d.id,
	// 		need3stExpert: d.need3stExpert,
	// 		murmurInclusion: d.murmurInclusion,
	// 		murmurAssessment: d.murmurAssessment,
	// 	}
		
	// 	if(!d.need3stExpert){
	// 		d.data.pop()
	// 	}

	// 	d.data.forEach( (exp, index) => {
	// 		keys(exp).forEach( key => {
	// 			res[key+"_"+index] = exp[key]
	// 		})
	// 	})
	// 	return res
	// })

	let header = [
		"id",
		"patient",
		"spot",
		"qtyAI",
		"needExperts",
		"nMr",
		"nHR",
		"nS1",
		"nS2",
		"murmur_1",
		// "confMurmur_1",
		"murmur_2",
		// "confMurmur_2",
		"murmur_3",
		// "confMurmur_3",
		"murmurInclusion",
		"murmurAssessment",
		"murmurAI",
		"s1_1",
		// "confS1_1",
		"s1_2",
		// "confS1_2",
		"s1_3",
		// "confS1_3",
		"s1Inclusion",
		"s1Assessment",
		
		"s2_1",
		// "confS2_1",
		"s2_2",
		// "confS2_2",
		"s2_3",
		// "confS2_3",
		"s2Inclusion",
		"s2Assessment",

		"hr_1",
		// "confHR_1",
		"hr_2",
		// "confHR_2",
		"hr_3",
		// "confHR_3",
		"hrInclusion",
		"hrAssessment",
		"hrAI"
	]


	// console.log(data)
	await saveXLSX(
		data,
		RES_XLSX,
		"data",
		header
	)



	// console.log(data.filter(row => applyRules(row, rulesForAdvancedExpert, orReducer)))

	// data = data.map( d => {
	// 	let f = find( pred, p => p.patient_id == d['Patient ID'] && p.record_spot == d['Body Spot'] )
	// 	if(f){
	// 		d['AI murmur detection'] = (f.has_murmur) ? 'present' : 'absent'
	// 	} else {
	// 		console.log("Not Found",d['Patient ID'], d['Body Spot'])
	// 	}
		
	// 	d.absentCount = keys(d).filter( key => key.startsWith("m") && d[key] == 'absent').length
	// 	d.presentCount = keys(d).filter( key => key.startsWith("m") && d[key] == 'present').length
	// 	d.mode = ( d.absentCount > d.presentCount ) ? 'absent' : 'present'
	// 	d.gradeAvg = avg( keys(d).filter( key => key.startsWith("g")).map( key => d[key]) )
	// 	d.ignoreByPresents = (Math.abs(d.absentCount - d.presentCount) < 2) ? "ignore" : ""
	// 	// d.ignoreByGrade = (d.mode == 'present' && d.gradeAvg < 2) ? "ignore" : ""
		
	// 	d.TP = (d.mode == 'present' && d['AI murmur detection'] == 'present') ? 1 : 0
	// 	d.FP = (d.mode == 'absent' && d['AI murmur detection'] == 'present') ? 1 : 0
	// 	d.TN = (d.mode == 'absent' && d['AI murmur detection'] == 'absent') ? 1 : 0
	// 	d.FN = (d.mode == 'present' && d['AI murmur detection'] == 'absent') ? 1 : 0
	
	// 	return d
	// })

	// let filtered_data = data.filter( d => !d.ignoreByPresents) // && !d.ignoreByGrade)
	// let cm =  {
	// 	TP: sum(filtered_data.map( d => d.TP)),
	// 	FP: sum(filtered_data.map( d => d.FP)),
	// 	TN: sum(filtered_data.map( d => d.TN)),
	// 	FN: sum(filtered_data.map( d => d.FN))
	// }

	// let metrics = {
	// 	Accuracy: (cm.TP+cm.TN) / (cm.TP+cm.TN+cm.FP+cm.FN),
	// 	Sensitivity: cm.TP / (cm.TP + cm.FN),
	// 	Specificity: cm.TN / (cm.TN + cm.FP)
	// }

	// console.log(filtered_data.length, "from", data.length, `(${(100 * (filtered_data.length)/data.length).toFixed(2)}%)`)
	// console.log(cm)
	// console.log(metrics)

	// let kappa_data = filtered_data.map( d => [d.mode,d['AI murmur detection']] )

	// let kappa_result = await R.call("./src/R/kappa-light.r", "execute", {data: kappa_data})

	// console.log(kappa_result.join("\n"))


	// await saveXLSX(
	// 	data,
	// 	`${TEMP}/exp-mur-out.xlsx`,
	// 	"data"
	// )


}

run()

