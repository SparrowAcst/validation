const googledriveService = require("../utils/google-drive")
const { loadXLSX, saveXLSX } = require("../utils/xlsx")
const { writeFile } = require("../utils/file-system")
const { find, keys, sortBy, extend, groupBy, isUndefined } = require("lodash")
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
			`./data/pilot/pilot-5-source.xlsx`,
			"data"
	)

	data = data.map( d => {
		d.record = `${d.patient}-${d.spot}`
		return d
	})

	data = groupBy(sortBy(data, row => row.expert), row => row.record)
	data = keys(data).map( key => extend({}, {
		id: key, 
		patient:data[key][0].patient, 
		spot:data[key][0].spot, 
		data: data[key]
	}))

	// console.log(data)


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


		
	// data = data
	// 	.map( row => {
	// 		row.need3stExpert = applyRules(row, rulesForAdvancedExpert)
	// 		return row
	// 	})
	// 	.map( row => {
	// 		if(!row.need3stExpert){
	// 			row.data.pop()
	// 		}
	// 		return row
	// 	})


////////////////////////// inclusion in murmur analysis //////////////////////////////////

	// const murmurExclusionRules = {
	// 	rules: [
	// 		row => {
	// 			return row.data.filter( d => d.confMurmur == "non confident").length > 1
	// 		}	
	// 	]
	// } 

	// data = data.map( row => {
	// 	row.murmurInclusion = !applyRules(row, murmurExclusionRules)
	// 	return row
	// })

//////////////////////////////////////////////////////////////////////////////////////////

////////////////////////// murmur assessment //////////////////////////////////

	const murmurAssessmentRules = {
		rules: [
			row => {
				let a = row.data.filter(d => d) //( d => d.confMurmur == "confident")
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
			// needExperts: (d.need3stExpert) ? 3 : 2,
			murmurInclusion: d.murmurInclusion,
			murmurAssessment: d.murmurAssessment,
			// murmur_1: d.data[0].murmur,
			// confMurmur_1: d.data[0].confMurmur,
			// murmur_2: d.data[1].murmur,
			// confMurmur_2: d.data[1].confMurmur,
			// murmur_3: (d.need3stExpert) ? d.data[2].murmur : undefined,
			// confMurmur_3: (d.need3stExpert) ? d.data[2].confMurmur: undefined,
		}
		
		d.data.forEach((v, index) => {
			res["murmur_"+(index+1)] = v.murmur
			res["confMurmur_"+(index+1)] = v.confMurmur
			
		})

		return res

	})


	let st_data = require("../../.temp/v3p__dr.json")


	data.forEach( row => {
		let f = find(st_data, s => s.patient_id == row.patient && s.record_spot == row.spot)
		row.murmurAI = (f) ? (f.has_murmur) ? "present" : "absent" : undefined
	})





	// console.log(data)
	await saveXLSX(
		data,
		`./data/pilot/pilot-5-murmur-1.xlsx`,
		"murmur"
	)





}

run()

