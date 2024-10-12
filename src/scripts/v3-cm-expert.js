// Table header
//  tester	patient	spot	Insufficient quality, the file was not assessed 	The murmur is absent 	murmur	confMurmur

const { loadXLSX, saveXLSX } = require("../utils/xlsx")
const { writeFile } = require("../utils/file-system")
const { find, keys, sortBy, extend, groupBy, isUndefined, last } = require("lodash")
const { loadJSON, unlink } = require("../utils/file-system")
const { avg, std, mode, anomals, sum, evaluateMeasure } = require("../utils/stat")
const evaluateCM = require("../utils/confusion-matrix")


const DATA_XLSX = "./data/structures/CM/PATIENT-MURMUR-DETECTION-ALL.xlsx"

// const EXP_SELF_XLSX = "./data/structures/V3-AI-Validation-2024/10.7 Test 7. Validation of informativeness of Stethophone’s heart sound analysis algorithm for recordings made by lay users/murmur-lay-conf.xlsx"


const metrics = [
	"Accuracy",
	"Sensivity",
	"Specificity",
	"Kappa"
]


const spots = [
	"erbs",
	"tricuspid",
	"apex",
	"pulmonary",
	"aortic",
	"erbsRight",
	"leftCarotid",
	"rightCarotid"
]


const templ = "expselfmr"
const experts = [1,2,3,4,5,6]

const run = async () => {

let data = await loadXLSX(DATA_XLSX, "analysis")


experts.forEach( expert => {

		let assessment = `${templ}_${expert}` 
		let res = extend({}, metrics)

		metrics.forEach( key => {
			res[key] = evaluateCM( 
				data.map( r => r[assessment]),
				data.map( r => r.ref),
				key,
				"present" 
			)
		})

		console.log(
			
			expert,
			"\t",
			res.Accuracy.matrix.tn,
			"\t",
			res.Accuracy.matrix.fp,
			"\t",
			res.Accuracy.matrix.fn,
			"\t",
			res.Accuracy.matrix.tp,
			"\t",
			res.Accuracy.value,
			"\t",
			res.Specificity.value,
			"\t",
			res.Sensivity.value,
			"\t",
			res.Kappa.value
			
		)
})


let res = extend({}, metrics)

metrics.forEach( key => {
	res[key] = evaluateCM( 
		data
			.map( r => r[templ]),
		data
			.map( r => r.ref),
		key,
		"present" 
	)
})

console.log(
			
			"\t",
			res.Accuracy.matrix.tn,
			"\t",
			res.Accuracy.matrix.fp,
			"\t",
			res.Accuracy.matrix.fn,
			"\t",
			res.Accuracy.matrix.tp,
			"\t",
			res.Accuracy.value,
			"\t",
			res.Specificity.value,
			"\t",
			res.Sensivity.value,
			"\t",
			res.Kappa.value
			
		)

}

run()

