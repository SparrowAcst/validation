const googledriveService = require("../utils/google-drive")
const { loadXLSX, saveXLSX } = require("../utils/xlsx")
const { writeFile } = require("../utils/file-system")
const { find, keys } = require("lodash")
const { loadJSON, unlink } = require("../utils/file-system")
const { avg, std, mode, anomals, sum } = require("../utils/stat")
const R = require('../utils/R')

const ROOT = "V3-VALIDATION-TEST-DATA"
const PREPROCESS = `${ROOT}/!PREPROCESS`
const HR_DATA = `${PREPROCESS}/heart_rate.xlsx`

const RESULTS = `${ROOT}/!RESULTS`
const TEST_RESULTS = `${RESULTS}/10.1.1 Test 1.1: Accuracy of HR estimation by Stethophone v3.0.0 in pseudo clinical environment`

const TEMP = "./.temp"



const delay = ms => new Promise( resolve => {
	setTimeout(() => {resolve()}, ms)
})

const prepareFiles = async path => {
	let googleDrive = await googledriveService.create(path)
	return googleDrive	 
}





const run = async () => {

	let	data = await loadXLSX(
			`${TEMP}/exp-mur-input.xlsx`,
			"data"
	)

// data = data.filter( d => d.m1 && d.m2 && d.m3 && d.m4 && d.m5 && d.m6)


	let pred = loadJSON(`${TEMP}/v3p__dr.json`)	


	data = data.map( d => {
		let f = find( pred, p => p.patient_id == d['Patient ID'] && p.record_spot == d['Body Spot'] )
		if(f){
			d['AI murmur detection'] = (f.has_murmur) ? 'present' : 'absent'
		} else {
			console.log("Not Found",d['Patient ID'], d['Body Spot'])
		}
		
		d.absentCount = keys(d).filter( key => key.startsWith("m") && d[key] == 'absent').length
		d.presentCount = keys(d).filter( key => key.startsWith("m") && d[key] == 'present').length
		d.mode = ( d.absentCount > d.presentCount ) ? 'absent' : 'present'
		d.gradeAvg = avg( keys(d).filter( key => key.startsWith("g")).map( key => d[key]) )
		d.ignoreByPresents = (Math.abs(d.absentCount - d.presentCount) < 2) ? "ignore" : ""
		// d.ignoreByGrade = (d.mode == 'present' && d.gradeAvg < 2) ? "ignore" : ""
		
		d.TP = (d.mode == 'present' && d['AI murmur detection'] == 'present') ? 1 : 0
		d.FP = (d.mode == 'absent' && d['AI murmur detection'] == 'present') ? 1 : 0
		d.TN = (d.mode == 'absent' && d['AI murmur detection'] == 'absent') ? 1 : 0
		d.FN = (d.mode == 'present' && d['AI murmur detection'] == 'absent') ? 1 : 0
	
		return d
	})

	let filtered_data = data.filter( d => !d.ignoreByPresents) // && !d.ignoreByGrade)
	let cm =  {
		TP: sum(filtered_data.map( d => d.TP)),
		FP: sum(filtered_data.map( d => d.FP)),
		TN: sum(filtered_data.map( d => d.TN)),
		FN: sum(filtered_data.map( d => d.FN))
	}

	let metrics = {
		Accuracy: (cm.TP+cm.TN) / (cm.TP+cm.TN+cm.FP+cm.FN),
		Sensitivity: cm.TP / (cm.TP + cm.FN),
		Specificity: cm.TN / (cm.TN + cm.FP)
	}

	console.log(filtered_data.length, "from", data.length, `(${(100 * (filtered_data.length)/data.length).toFixed(2)}%)`)
	console.log(cm)
	console.log(metrics)

	let kappa_data = filtered_data.map( d => [d.mode,d['AI murmur detection']] )

	let kappa_result = await R.call("./src/R/kappa-light.r", "execute", {data: kappa_data})

	console.log(kappa_result.join("\n"))


	await saveXLSX(
		data,
		`${TEMP}/exp-mur-out.xlsx`,
		"data"
	)


}

run()

