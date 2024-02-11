const googledriveService = require("../utils/google-drive")
const { loadXLSX, saveXLSX } = require("../utils/xlsx")
const R = require('../utils/R');
const { writeFile } = require("../utils/file-system")

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

	// let drive = await prepareFiles(PREPROCESS)
	
	// let file = drive.fileList(HR_DATA)[0]
	
	// if(file){
	// 	console.log("Download", file.path)	
	// 	await drive.downloadFiles({
	// 		fs: TEMP,
	// 		googleDrive: [file]
	// 	})
	// 	await delay(1000)
	// 	console.log("Load XLSX", `${TEMP}/${file.name}`)	
		
let file ={
	name: "heart_rate_repeat.xlsx"
}
		data = await loadXLSX(
			`${TEMP}/${file.name}`,
			"data"
		)
	// }

	// let data = await loadXLSX("./.temp/HR_DATA-ecg.xlsx", "data")
	// console.log(data)
	
	data = data.filter( d => d.ST_heartRate && d.EKO_heartRate)

	let x = data.map(d => d.EKO_heartRate)
	let y = data.map(d => d.ST_heartRate)
	
	let result = await R.call("./src/R/bland-altman.r", "execute", {
		plot: `${TEMP}/test-hr-repeat-bland-altman-plot.png`,
		x,
		y,
		level: 0.8,
		delta: 10
	})

	console.log(result)
	
	writeFile(`${TEMP}/test-hr-repeat-result.txt`, result.join("\n"))

	// drive = await prepareFiles(TEST_RESULTS)

	// console.log(`UPLOAD: ${TEMP}/test-2-1-bland-altman-plot.png into ${TEST_RESULTS}`)
	// await drive.uploadFiles({
	// 	fs: [`${TEMP}/test-1-1-bland-altman-plot.png`],
	// 	googleDrive:`${TEST_RESULTS}`
	// })

	// console.log(`UPLOAD: ${TEMP}/test-2-1-result.txt into ${TEST_RESULTS}`)
	// await drive.uploadFiles({
	// 	fs: [`${TEMP}/test-1-1-result.txt`],
	// 	googleDrive:`${TEST_RESULTS}`
	// })


}

run()

