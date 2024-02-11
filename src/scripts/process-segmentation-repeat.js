const googledriveService = require("../utils/google-drive")
const { loadXLSX, saveXLSX } = require("../utils/xlsx")
const R = require('../utils/R');
const { writeFile } = require("../utils/file-system")
const { last, groupBy, sortBy, find, keys } = require("lodash")

const ROOT = "V3-VALIDATION-TEST-DATA"
const PREPROCESS = `${ROOT}/!PREPROCESS`
const SEGMENTATION = `${PREPROCESS}/segmentation-ecg.xlsx`

const RESULTS = `${ROOT}/!RESULTS`
const TEST_RESULTS = `${RESULTS}/10.2.1 Test 2.1: Validation of heart sound segmentation by Stethophone v3.0.0 in pseudo clinical environment`

const TEMP = "./.temp"



const delay = ms => new Promise( resolve => {
	setTimeout(() => {resolve()}, ms)
})

const prepareFiles = async path => {
	let googleDrive = await googledriveService.create(path)
	return googleDrive	 
}




const run = async () => {


	let data = await loadXLSX("./.temp/segmentation-repeathr.xlsx", "data")
	
	data = data.map( d => {
		let day = last(d.recordId.split("-")).substring(1)
		d.day = day
		return d
	}).filter( d => !d.ignore)

	data = groupBy( data, d => d.day)
	
	let result = []
	

	for( day of  keys(data)) {
		
		// console.log("Day:", day)
// 		result += 
// `
// DAY: ${day}
// PLOT: ${TEMP}/!SEG-REPEAT-${day}-bland-altman-plot.png
// `
		
		let x = data[day].map(d => d.EKO_fit)
		let y = data[day].map(d => d.ST_fit)
	
		let ba = await R.call("./src/R/bland-altman.r", "execute", 
		{
			plot: `${TEMP}/!SEG-REPEAT-${day}-bland-altman-plot.png`,
			x,
			y,
			level: 0.8
		})	
		// console.log(ba)
		
		let bias = ba[6].split(" ").filter(d => d)[1]
		let lloa = ba[7].split(" ").filter(d => d)[2]
		let uloa = ba[8].split(" ").filter(d => d)[2]

		result.push({bias,lloa,uloa})

		console.log(`${day}\t${bias}\t${lloa}\t${uloa}`)
		// console.log("Bias", bias)
		// result += "\n"+ ba.join("\n")

	}


	console.log(result)

	let diff = []

	for(let i=0; i< result.length-1; i++){
		for(let j=i+1; j<result.length; j++){
			console.log(`${result[j].bias - result[i].bias}\t${result[j].lloa - result[i].lloa}\t${result[j].uloa - result[i].uloa}`)
		}
	}

	// console.log(result)
	// let x = data.map(d => d.EKO_start)
	// let y = data.map(d => d.ST_start)
	
	// let result = await R.call("./src/R/bland-altman.r", "execute", {
	// 	plot: `${TEMP}/test-2-1-bland-altman-plot.png`,
	// 	x,
	// 	y,
	// 	level: 0.8,
	// 	delta: 0.16
	// })

	// writeFile(`${TEMP}/test-2-1-result.txt`, result.join("\n"))

	// drive = await prepareFiles(TEST_RESULTS)

	// console.log(`UPLOAD: ${TEMP}/test-2-1-bland-altman-plot.png into ${TEST_RESULTS}`)
	// await drive.uploadFiles({
	// 	fs: [`${TEMP}/test-2-1-bland-altman-plot.png`],
	// 	googleDrive:`${TEST_RESULTS}`
	// })

	// console.log(`UPLOAD: ${TEMP}/test-2-1-result.txt into ${TEST_RESULTS}`)
	// await drive.uploadFiles({
	// 	fs: [`${TEMP}/test-2-1-result.txt`],
	// 	googleDrive:`${TEST_RESULTS}`
	// })


}

run()

