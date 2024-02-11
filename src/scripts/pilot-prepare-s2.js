const googledriveService = require("../utils/google-drive")
const { loadXLSX, saveXLSX } = require("../utils/xlsx")
const { writeFile } = require("../utils/file-system")
const { find, keys, sortBy, extend, groupBy, isUndefined } = require("lodash")
const { loadJSON, unlink } = require("../utils/file-system")
const { avg, std, mode, anomals, sum, max } = require("../utils/stat")
const R = require('../utils/R')



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


////////////////////////// inclusion in hr analysis //////////////////////////////////

	const s2ExclusionRules = {
		rules: [
			row => {
				return row.data.filter( d => d.confS1S2 == "non confident").length > 1
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

////////////////////////// hr assessment //////////////////////////////////

	const s2AssessmentRules = {
		rules: [
			row => {
				let a = row.data.filter( d => d.confS1S2 == "confident" && d.s2 != "cannot answer")
				if(a.length > 1){
					let presents = a.filter( d => d.s2 == "yes").length
					let absents = a.length - presents
					return ((presents - absents) > 0) ? "yes" : "no"	
				}
				
			},

			
		],
	} 

	data
		.filter( d => d.s2Inclusion)
		.forEach( row => {
			row.s2Assessment = applyRules(row, s2AssessmentRules)
			// return row
		})

//////////////////////////////////////////////////////////////////////////////////////////

	data = data.map( d => {
		let res = {
			id: d.id,
			patient: d.patient,
			spot: d.spot,
			needExperts: (d.need3stExpert) ? 3 : 2,
			s2Inclusion: (d.s2Inclusion) ? "include" : "exclude",
			s2Assessment: d.s2Assessment,
			s2_1: d.data[0].s2,
			confS1S2_1: d.data[0].confS1S2,
			s2_2: d.data[1].s2,
			confS1S2_2: d.data[1].confS1S2,
			s2_3: (d.need3stExpert) ? d.data[2].s2 : undefined,
			confS1S2_3: (d.need3stExpert) ? d.data[2].confS1S2: undefined,
		}
		return res

	})


	// let st_data = require("../../.temp/v3p__dr.json")


	// data.forEach( row => {
	// 	let f = find(st_data, s => s.file_id == row.id)
	// 	row.hrAI = (f) ? f.heart_rate : undefined
	// })


	await saveXLSX(
		data,
		`./data/pilot/pilot-ea-s2.xlsx`,
		"s2"
	)

}

run()

