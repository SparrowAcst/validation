const googledriveService = require("../utils/google-drive")
const { loadXLSX, saveXLSX } = require("../utils/xlsx")
const { writeFile } = require("../utils/file-system")
const { find, keys, sortBy, extend, groupBy } = require("lodash")
const { loadJSON, unlink } = require("../utils/file-system")
const { avg, std, mode, anomals, sum } = require("../utils/stat")
const R = require('../utils/R')



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

	let	data = await loadXLSX(
			`./data/pilot/expert-assessments.xlsx`,
			"data"
	)

	data = groupBy(sortBy(data, row => row.expert), row => row.record)
	data = keys(data).map( key => extend({}, {
		id: key, 
		patient:data[key][0].patient, 
		spot:data[key][0].spot, 
		data: data[key]
	}))


////////////////////////// need advanced expert ///////////////////////////

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


		
	data = data
		.map( row => {
			row.need3stExpert = applyRules(row, rulesForAdvancedExpert)
			return row
		})
		.map( row => {
			if(!row.need3stExpert){
				row.data.pop()
			}
			return row
		})


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

//////////////////////////////////////////////////////////////////////////////////////////

////////////////////////// murmur assessment //////////////////////////////////

	const murmurAssessmentRules = {
		rules: [
			row => {
				let a = row.data.filter( d => d.confMurmur == "confident")
				let presents = a.filter( d => d.murmur == "present").length
				let absents = a.length - presents
				return ((presents - absents) > 0) ? "present" : "absent"
			},
		],
	} 

	data
		.filter( d => d.murmurInclusion)
		.forEach( row => {
			row.murmurAssessment = applyRules(row, murmurAssessmentRules)
			// return row
		})

//////////////////////////////////////////////////////////////////////////////////////////

	data = data.map( d => {
		let res = {
			id: d.id,
			patient: d.patient,
			spot: d.spot,
			needExperts: (d.need3stExpert) ? 3 : 2,
			murmurInclusion: (d.murmurInclusion) ? "include" : "exclude",
			murmurAssessment: d.murmurAssessment,
			murmur_1: d.data[0].murmur,
			confMurmur_1: d.data[0].confMurmur,
			murmur_2: d.data[1].murmur,
			confMurmur_2: d.data[1].confMurmur,
			murmur_3: (d.need3stExpert) ? d.data[2].murmur : undefined,
			confMurmur_3: (d.need3stExpert) ? d.data[2].confMurmur: undefined,
		}
		return res

	})


	let st_data = require("../../.temp/v3p__dr.json")


	data.forEach( row => {
		let f = find(st_data, s => s.file_id == row.id)
		row.murmurAI = (f) ? (f.has_murmur) ? "present" : "absent" : undefined
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



	// console.log(data)
	await saveXLSX(
		data,
		`./data/pilot/ea3exp.xlsx`,
		"murmur"
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

