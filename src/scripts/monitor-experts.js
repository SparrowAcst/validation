const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate, groupBy, keys } = require("lodash")
const { loadJSON, unlink } = require("../utils/file-system")
const { saveXLSX, loadXLSX } = require("../utils/xlsx")


const ROOT = "V3-VALIDATION-TEST-DATA"
const MONITOR = `${ROOT}/!MONITOR`
const EXPERT_ROOT = `${ROOT}/5.3. Recruitment of experts`
const EXPERT_SCAN = `${EXPERT_ROOT}/SOURCE DOCS`
const EXPERT_FORM = `${EXPERT_ROOT}/experts`

const TEMP = "./.temp"


const delay = ms => new Promise( resolve => {
	setTimeout(() => {resolve()}, ms)
})

const prepareFiles = async path => {
	let googleDrive = await googledriveService.create(path)
	return googleDrive	 
}


const run = async () => {

	let monitorData = []

	let drive = await prepareFiles(EXPERT_ROOT)

	let file = drive.fileList(EXPERT_FORM)[0]

	if (file) {

		console.log("Download", file.path)	
		await drive.downloadFiles({
			fs: TEMP,
			googleDrive: [file]
		})
		console.log("Delay")
		await delay(1000)
		console.log("Load XLSX", `${TEMP}/${file.name}.xlsx`)	
		

		let data = await loadXLSX(
			`${TEMP}/${file.name}.xlsx`,
			"data"
		)
		
		monitorData.push({property:"Expert Form Path", value: EXPERT_FORM})
		monitorData.push({property:"Experts", value: data.length})

		let scans = drive.fileList(`${EXPERT_SCAN}/*.*`)
		monitorData.push({property:"Scan Path", value: EXPERT_SCAN})
		monitorData.push({property:"Scans", value: scans.length})

	}


	await saveXLSX(
		monitorData,
		`${TEMP}/experts.xlsx`,
		"data"
	)

	drive = await prepareFiles(`${ROOT}`)
	await drive.uploadFiles({
		fs: [`${TEMP}/experts.xlsx`],
		googleDrive:`${MONITOR}`
	})

	await unlink(`${TEMP}/experts.xlsx`)
	
	
}

run()

