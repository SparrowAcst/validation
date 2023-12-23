const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate, groupBy, keys } = require("lodash")
const { loadJSON, unlink } = require("../utils/file-system")
const { saveXLSX, loadXLSX } = require("../utils/xlsx")


const ROOT = "V3-VALIDATION-TEST-DATA"
const MONITOR = `${ROOT}/!MONITOR`
const PATIENT_ROOT = `${ROOT}/5.5.1.1. Preliminary screening and recruitment of patients and volunteers`
const PATIENT_FORM = `${PATIENT_ROOT}/patients`

const PATIENT_ECG_SCAN = `${ROOT}/5.5.2. Echocardiographic examinations and ECG/ECG`
const PATIENT_ECHO_ARCH = `${ROOT}/5.5.2. Echocardiographic examinations and ECG/ECHOCARDIOGRAPHY/DICOM`
const PATIENT_ECHO_PROTOCOL = `${ROOT}/5.5.2. Echocardiographic examinations and ECG/ECHOCARDIOGRAPHY/PROTOCOL`


const TEMP = "./.temp"


const delay = ms => new Promise( resolve => {
	setTimeout(() => {resolve()}, ms)
})

const prepareFiles = async path => {
	let googleDrive = await googledriveService.create(path)
	return googleDrive	 
}


const props = [
	"Age (years)",	
	"Sex (m/f)",	
	"BMI (kg/m2)",	
	"Diagnosis  (ICD-10-CM)",	
	"Heart murmur present (yes/no)",	
	"Atrial fibrillation present (yes/no)",	
	"Sinus rhythm at the moment of enrolling  (yes/no)"
]	

const statistic = (property, data) => {
	let g = groupBy(data, d => d[property])
	let value = keys(g).map( key => `"${key}": ${g[key].length}`).join(", ")
	return {
		property,
		value
	}
}



const run = async () => {

	let monitorData = []

	let drive = await prepareFiles(PATIENT_ROOT)

	let file = drive.fileList(PATIENT_FORM)[0]

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
		
		monitorData.push({property:"Patient Form Path", value: PATIENT_FORM})
		monitorData.push({property:"Patients", value: data.length})

		monitorData = monitorData.concat(props.map(p => statistic(p, data)))

	}

	drive = await prepareFiles(PATIENT_ECG_SCAN)
	monitorData.push({property:"Patient ECG Path", value: PATIENT_ECG_SCAN})
	monitorData.push({property:"Patient ECG Scans", value: drive.fileList().length})

	drive = await prepareFiles(PATIENT_ECHO_ARCH)
	monitorData.push({property:"Patient ECHO Arch Path", value: PATIENT_ECHO_ARCH})
	monitorData.push({property:"Patient ECHO Archs", value: drive.fileList().length})
	
	drive = await prepareFiles(PATIENT_ECHO_PROTOCOL)
	monitorData.push({property:"Patient ECHO Protocol Path", value: PATIENT_ECHO_PROTOCOL})
	monitorData.push({property:"Patient ECHO Protocols", value: drive.fileList().length})
	

	await saveXLSX(
		monitorData,
		`${TEMP}/patients.xlsx`,
		"data"
	)

	drive = await prepareFiles(`${ROOT}`)
	await drive.uploadFiles({
		fs: [`${TEMP}/patients.xlsx`],
		googleDrive:`${MONITOR}`
	})

	await unlink(`${TEMP}/patients.xlsx`)
	
	
}

run()

