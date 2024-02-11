const googledriveService = require("../utils/google-drive")
const { loadXLSX, saveXLSX } = require("../utils/xlsx")
const { groupBy, last, keys } = require("lodash")
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

	console.log("!!!!!!")
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

let file = {
	name: "heart_rate_repeat.xlsx"
}
		
		let data = await loadXLSX(
			`${TEMP}/${file.name}`,
			"data"
		)
	// }

	// console.log(data)

	// let measures = ["01","02","03","04","05","06","07","08","09","10"]
	
	data = groupBy(data, d => d.measure)


	let result = []

	for(let day of keys(data)){
		
		let x = data[day].map(d => d["EKO_heartRate"])
		let y = data[day].map(d => d["ST_heartRate"])
		
		let r = await R.call("./src/R/bland-altman.r", "execute", {
			plot: `${TEMP}/!test-hr-repeat-${day}-bland-altman-plot.png`,
			x,
			y,
			level: 0.8,
			delta: 10
		})

		let bias = r[6].split(" ").filter(d => d)[1]
		let lloa = r[7].split(" ").filter(d => d)[2]
		let uloa = r[8].split(" ").filter(d => d)[2]

		result.push({bias,lloa,uloa})

		console.log(`${day}\t${bias}\t${lloa}\t${uloa}`)
	}



	for(let i=0; i< result.length-1; i++){
		for(let j=i+1; j<result.length; j++){
			console.log(`${result[j].bias - result[i].bias}\t${result[j].lloa - result[i].lloa}\t${result[j].uloa - result[i].uloa}`)
		}
	}

	// console.log(result)

	// writeFile(`${TEMP}/test-1-1-result.txt`, result.join("\n"))

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

