// Table header
//  tester	patient	spot	Insufficient quality, the file was not assessed 	The murmur is absent 	murmur	confMurmur

const { loadXLSX, saveXLSX } = require("../utils/xlsx")
const { writeFile } = require("../utils/file-system")
const { find, keys, sortBy, extend, groupBy, isUndefined, last } = require("lodash")
const { loadJSON, unlink } = require("../utils/file-system")
const { avg, std, mode, anomals, sum, evaluateMeasure } = require("../utils/stat")
const evaluateCM = require("../utils/confusion-matrix")


const DATA_XLSX = "./data/structures/CM/murmur-lay-conf.xlsx"

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





const run = async () => {

let data = await loadXLSX(DATA_XLSX, "data")

// spots.forEach( spot => {
// 	let d = data.filter( r => r.spot == spot )
// 	let total = d.length
// 	d = d.filter( r => r.murmurInclusion == "include")
// 	// console.log(spot, total, d.length)
// 	let res = extend({}, metrics)
// 	metrics.forEach( key => {
// 		res[key] = evaluateCM( 
// 			d.map( r => r.murmurAssessment),
// 			d.map( r => r.murmurAI),
// 			key,
// 			"present" 
// 		)
// 	})

// 	console.log(
// 		spot,
// 		"\t",
// 		d.length,
// 		"\t",
// 		res.Accuracy.matrix.tn,
// 		"\t",
// 		res.Accuracy.matrix.fp,
// 		"\t",
// 		res.Accuracy.matrix.fn,
// 		"\t",
// 		res.Accuracy.matrix.tp,
// 		"\t",
// 		res.Accuracy.value,
// 		"\t",
// 		res.Accuracy.ci.join("\t"),
// 		"\t",
// 		res.Sensivity.value,
// 		"\t",
// 		res.Sensivity.ci.join("\t"),
// 		"\t",
// 		res.Specificity.value,
// 		"\t",
// 		res.Specificity.ci.join("\t"),
// 		"\t",
// 		res.Kappa.value,
// 		"\t",
// 		res.Kappa.ci.join("\t"),
// 	)
// })

let res = extend({}, metrics)

metrics.forEach( key => {
	res[key] = evaluateCM( 
		data
			.filter( r => r.murmurInclusion == "include" )
			.map( r => r.murmurAssessment),
		data
			.filter( r => r.murmurInclusion == "include" )
			.map( r => r.murmurAI),
		key,
		"present" 
	)
})

console.log(
		// spot,
		"\t",
		data.length,
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
		res.Accuracy.ci.join("\t"),
		"\t",
		res.Sensivity.value,
		"\t",
		res.Sensivity.ci.join("\t"),
		"\t",
		res.Specificity.value,
		"\t",
		res.Specificity.ci.join("\t"),
		"\t",
		res.Kappa.value,
		"\t",
		res.Kappa.ci.join("\t"),
	)

	// let header = [
	// 	"patient",
	// 	"drmr",
	// 	"drmrcount",
	// 	"drmrspots",
	// 	"selfmr",
	// 	"selfmrcount",
	// 	"selfmrspots",
	// 	"expdrmr",
	// 	"expdrmrcount",
	// 	"expselfmr",
	// 	"expselfmrcount"
	// ]

	// await saveXLSX(res, RES_XLSX, "data", header)


}

run()

