// Table header
//  tester	patient	spot	Insufficient quality, the file was not assessed 	The murmur is absent 	murmur	confMurmur

const { loadXLSX, saveXLSX } = require("../utils/xlsx")
const { writeFile } = require("../utils/file-system")
const { find, keys, sortBy, extend, groupBy, isUndefined } = require("lodash")
const { loadJSON, unlink } = require("../utils/file-system")
const { avg, std, mode, anomals, sum, evaluateMeasure } = require("../utils/stat")

const INPUT_XLSX = "./data/structures/V3-AI-Validation-2024/9.2.3 Preliminary screening and recruitment of participants and volunteers/ecg_description.xlsx"
const RES_XLSX = "./data/structures/V3-AI-Validation-2024/9.2.3 Preliminary screening and recruitment of participants and volunteers/ecg-stat.xlsx"


const fields = [
	"Participant",	
	"HR",	
	"Synus rhithm",	
	"Atrial fibrillation",	
	"Ventricular premature beats",	
	"Atrial premature beats",	
	"P-Q length",	
	"LVH",	
	"RVH",	
	"Left atrium enlargement",	
	"Right atrium enlargement",	
	"Pathological Q wave",	
	"RBBB",	
	"Incomplete RBBB",	
	"LBBB", 	
	"Incomplete LBBB",	
	"LAFB",	
	"LPFB",	
	"1st AV block",	
	"2nd AV block type 1",	
	"2nd AV block type 2",	
	"2nd AV block 2:1",	
	"AV 3 degree block",	
	"Ischemic ST-depression",	
	"ST-elevation"
]

const categories = [
	"Synus rhithm",	
	"Atrial fibrillation",	
	"Ventricular premature beats",	
	"Atrial premature beats",	
	"LVH",	
	"RVH",	
	"Left atrium enlargement",	
	"Right atrium enlargement",	
	"Pathological Q wave",	
	"RBBB",	
	"Incomplete RBBB",	
	"LBBB", 	
	"Incomplete LBBB",	
	"LAFB",	
	"LPFB",	
	"1st AV block",	
	"2nd AV block type 1",	
	"2nd AV block type 2",	
	"2nd AV block 2:1",	
	"AV 3 degree block",	
	"Ischemic ST-depression",	
	"ST-elevation"
]

const catValues = ["no", "yes"]


const run = async () => {

	let	data = await loadXLSX(INPUT_XLSX, "data")
	data = data.map( d => d["HR"]).filter( d => d)
	console.log(data.length, data.length/62, (62-data.length), (62-data.length)/62)

	data = data.map(d => ({
		value: d,
		group: (d > 100) ? "HR 100+" : (d < 60) ? "HR 60-" : "HR 60-100"
	}))

	data = groupBy(data, d => d.group)

	keys(data).forEach( key => {
		let e = evaluateMeasure(data[key].map(d => d.value))
		console.log(key,"\t", e.values.length,"\t", e.min, "\t", e.max, "\t", e.mean, "\t", e.std, "\t", e.confidenceInterval[0], "\t", e.confidenceInterval[1] ) 
	})
	
	// console.log(evaluateMeasure(data))


	// let res = []
	// categories.forEach( cat => {
	// 	let values = groupBy(data.map(d => d[cat]))
	// 	res.push({
	// 		Name : cat,
	// 		noCount: (values["no"]) ? values["no"].length : 0,
	// 		noPrs: Number.parseFloat((100 * ((values["no"]) ? values["no"].length : 0) / data.length).toFixed(1)),
	// 		yesCount: (values["yes"]) ? values["yes"].length : 0,
	// 		yesPrs: Number.parseFloat((100 * ((values["yes"]) ? values["yes"].length : 0) / data.length).toFixed(1)),
				
	// 	})
	// })

	// console.log(res)

	// let header = [
	// 	"Name",
	// 	"noCount",
	// 	"noPrs",
	// 	"yesCount",
	// 	"yesPrs"
	// ]

	// await saveXLSX(res, RES_XLSX, "data", header)


}

run()

