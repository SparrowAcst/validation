// Table header
//  tester	patient	spot	Insufficient quality, the file was not assessed 	The murmur is absent 	murmur	confMurmur

const { loadXLSX, saveXLSX } = require("../utils/xlsx")
const { writeFile } = require("../utils/file-system")
const { find, keys, sortBy, extend, groupBy, isUndefined } = require("lodash")
const { loadJSON, unlink } = require("../utils/file-system")
const { avg, std, mode, min, anomals, sum, evaluateMeasure } = require("../utils/stat")

const INPUT_XLSX = "./data/structures/V3-AI-Validation-2024/9.2.3 Preliminary screening and recruitment of participants and volunteers/patients.xlsx"
const RES_XLSX = "./data/structures/V3-AI-Validation-2024/9.2.3 Preliminary screening and recruitment of participants and volunteers/patients-stat.xlsx"



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
	// "Synus rhithm",	
	// "Atrial fibrillation",	
	// "Ventricular premature beats",	
	// "Atrial premature beats",	
	// "LVH",	
	// "RVH",	
	// "Left atrium enlargement",	
	// "Right atrium enlargement",	
	// "Pathological Q wave",	
	// "RBBB",	
	// "Incomplete RBBB",	
	// "LBBB", 	
	// "Incomplete LBBB",	
	// "LAFB",	
	// "LPFB",	
	// "1st AV block",	
	// "2nd AV block type 1",	
	// "2nd AV block type 2",	
	// "2nd AV block 2:1",	
	// "AV 3 degree block",	
	// "Ischemic ST-depression",	
	// "ST-elevation"

	"murmur",	
	"sinus",	
	"fib"

]

const catValues = ["no", "yes"]


const run = async () => {

	let	data = await loadXLSX(INPUT_XLSX, "data")

	data = data.map( d => d["bmi"]) //.filter( d => d)
	// console.log(data.length, data.length/62, (62-data.length), (62-data.length)/62)
	// let e = evaluateMeasure(data)
	// console.log("Total","\t", e.values.length,"\t", e.min, "\t", e.max, "\t", e.median,"\t",e.mean, "\t", e.std, "\t", e.confidenceInterval[0], "\t", e.confidenceInterval[1] ) 
	// return

// Below 18.5	Underweight
// 18.5 – 24.9	Healthy Weight
// 25.0 – 29.9	Overweight
// 30.0 and Above	Obesity

	
	data = data.map(d => ({
		value: d,
		group: (d < 18.5) 
					? "Below 18.5 Underweight" 
					: (d < 24.9 && d >= 18.5) 
						? "18.5 – 24.9 Healthy Weight" 
						: (d < 30.0 && d >= 25.0)
							? "25.0 – 29.9 Overweight"
							: "30.0 and Above Obesity"
	}))

	let e = evaluateMeasure(data.map(d => d.value))
	console.log("Total","\t", e.values.length,"\t", e.min, "\t", e.max, "\t", e.median,"\t",e.mean, "\t", e.std, "\t", e.confidenceInterval[0], "\t", e.confidenceInterval[1] ) 


	data = groupBy(data, d => d.group)

	keys(data).forEach( key => {
		let e = evaluateMeasure(data[key].map(d => d.value))
		console.log(key,"\t", e.values.length,"\t", e.min, "\t", e.max, "\t", e.median,"\t",e.mean, "\t", e.std, "\t", e.confidenceInterval[0], "\t", e.confidenceInterval[1] ) 
	})
	
	return

	// console.log(evaluateMeasure(data))


	let res = []
	categories.forEach( cat => {
		let values = groupBy(data.map(d => d[cat]))
		let res = 
		{
			Name : cat,
			noCount: (values["no"]) ? values["no"].length : 0,
			noPrs: Number.parseFloat((100 * ((values["no"]) ? values["no"].length : 0) / data.length).toFixed(1)),
			yesCount: (values["yes"]) ? values["yes"].length : 0,
			yesPrs: Number.parseFloat((100 * ((values["yes"]) ? values["yes"].length : 0) / data.length).toFixed(1)),
				
		}
		console.log(res.Name, "\t", res.noCount, "\t", res.noPrs, "\t", res.yesCount, "\t", res.yesPrs)

	})


	
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

