const googledriveService = require("../utils/google-drive")
const { loadXLSX, saveXLSX } = require("../utils/xlsx")
const R = require('../utils/R');
const { writeFile } = require("../utils/file-system")

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

	let drive = await prepareFiles(PREPROCESS)
	
	let file = drive.fileList(SEGMENTATION)[0]
	
	if(file){
		console.log("Download", file.path)	
		await drive.downloadFiles({
			fs: TEMP,
			googleDrive: [file]
		})
		await delay(1000)
		console.log("Load XLSX", `${TEMP}/${file.name}`)	
		
		data = await loadXLSX(
			`${TEMP}/${file.name}`,
			"data"
		)
	}

	// let data = await loadXLSX("./.temp/segmentation-ecg.xlsx", "data")
	
	let x = data.map(d => d.EKO_start)
	let y = data.map(d => d.ST_start)
	
	let result = await R.call("./src/R/bland-altman.r", "execute", {
		plot: `${TEMP}/test-2-1-bland-altman-plot.png`,
		x,
		y,
		level: 0.8,
		delta: 0.16
	})

	writeFile(`${TEMP}/test-2-1-result.txt`, result.join("\n"))

	drive = await prepareFiles(TEST_RESULTS)

	console.log(`UPLOAD: ${TEMP}/test-2-1-bland-altman-plot.png into ${TEST_RESULTS}`)
	await drive.uploadFiles({
		fs: [`${TEMP}/test-2-1-bland-altman-plot.png`],
		googleDrive:`${TEST_RESULTS}`
	})

	console.log(`UPLOAD: ${TEMP}/test-2-1-result.txt into ${TEST_RESULTS}`)
	await drive.uploadFiles({
		fs: [`${TEMP}/test-2-1-result.txt`],
		googleDrive:`${TEST_RESULTS}`
	})


}

run()

