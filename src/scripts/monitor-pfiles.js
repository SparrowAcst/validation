const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate, groupBy, keys } = require("lodash")
const { loadJSON, unlink } = require("../utils/file-system")
const { saveXLSX, loadXLSX } = require("../utils/xlsx")
const path = require("path")


const ROOT = "V3-VALIDATION-TEST-DATA"
const MONITOR = `${ROOT}/!MONITOR`
const TEMP = "./.temp"


const properties = [
	{
		name: "ECG_scan",
		path: `${ROOT}/5.5.2. Echocardiographic examinations and ECG/ECG`	
	},
	{
		name: "ECHO_scan",
		path: `${ROOT}/5.5.2. Echocardiographic examinations and ECG/ECHOCARDIOGRAPHY/PROTOCOL`	
	},
	{
		name: "ECHO_zip",
		path: `${ROOT}/5.5.2. Echocardiographic examinations and ECG/ECHOCARDIOGRAPHY/DICOM`	
	},
	{
		name: "v3p__self",
		report: `${ROOT}/RECORDINGS/v3p__self/v3p__self.json`	
	},
	{
		name: "v3p__ecg",
		report: `${ROOT}/RECORDINGS/v3p__ecg/v3p__ecg.json`	
	},
	{
		name: "v3p__ecg-EKO",
		path: `${ROOT}/5.5.1.5.1. Simultaneous recording of heart sound and ECG (dataset V3PxECG)/Eko CORE 500/files`	
	},
	{
		name: "v3p__dr",
		report: `${ROOT}/RECORDINGS/v3p__dr/v3p__dr.json`	
	},
	{
		name: "v3p__repeathr",
		report: `${ROOT}/RECORDINGS/v3p__repeathr/v3p__repeathr.json`	
	},
	{
		name: "v3p__repeathr-EKO",
		path: `${ROOT}/5.5.1.5.2. Simultaneous recording of heart sound and ECG (dataset v3PxRepeatHR)/Eko CORE 500/files`	
	},
	{
		name: "v3p__repeatmur",
		report: `${ROOT}/RECORDINGS/v3p__repeatmur/v3p__repeatmur.json`	
	},
////////////////////////////// form scans /////////////////////////////////////////////	

	{
		name: "5.6.1. Assessment of patients’ heart murmur by experts",
		getId: data => data.name.replace(/(p[0-9]{2})(.*)/, "$1"),
		path: `${ROOT}/5.6.1. Assessment of patients’ heart murmur by experts (dataset V3PxDr, recordings made by Eko CORE 500)/SOURCE DOCS`
	},
	{
		name: "5.6.2. Experts assessment of informativeness of Stethophone’s heart sound analysis algorithm",
		getId: data => data.name.replace(/(p[0-9]{2})(.*)/, "$1"),
		path: `${ROOT}/5.6.2. Experts assessment of informativeness of Stethophone’s heart sound analysis algorithm for recordings made by lay users (dataset v3PxSelf)/SOURCE DOCS`
		
	},
	// {
	// 	name: "5.6.3. Validation of heart sound quality assessment by Stethophone v3 in pseudo clinical environment",
	// 	path: `${ROOT}/5.6.3. Validation of heart sound quality assessment by Stethophone v3 in pseudo clinical environment/SOURCE DOCS`
	// },
	// {
	// 	name: "5.6.4. Validation of Loudness of the Chest Sound Provided by Stethophone v3.0.0",
	// 	path: `${ROOT}/5.6.4. Loudness of Stethophone v3 Sound Assessment/SOURCE DOCS`
	// },
	// {
	// 	name: "5.6.5. Assess frequency spectra of Stethophone v3.0.0 sound",
	// 	path: `${ROOT}/5.6.5. Frequency Spectrum of Stethophone v3 Sound Assessment (dataset v3Patientx)/SOURCE DOCS`
	// },
	// {
	// 	name: "5.6.6. Temporal Acoustic Resolution Validation of Stethophone v3.0.0 by Auscultation",
	// 	path: `${ROOT}/5.6.6. Temporal Acoustic Resolution Validation by Auscultation (dataset v3Patientx)/SOURCE DOCS`
	// },
	// {
	// 	name: "5.6.7. Assessment of Chest Sound Distortion",
	// 	n: "5.6.7.",
	// 	path: `${ROOT}/5.6.7. Assessment of Chest Sound Distortion (dataset v3iPhxPsPt)/SOURCE DOCS`
	// },
	// {
	// 	name: "5.6.8. Assessment of Internal Hardware Noise in Stethophone v3 Sound",
	// 	path: `${ROOT}/5.6.8. Assessment of Internal Hardware Noise in Stethophone v3 Sound (dataset v3iPhxPsPt)/SOURCE DOCS`
	// },
	// {
	// 	name: "5.6.9. Assessment of Informativeness of Oscillograms and Spectrograms of Stethophone v3",
	// 	path: `${ROOT}/5.6.9. Informativeness of Oscillograms and Spectrograms of Stethophone v3 Assessment (dataset v3Patientx)/SOURCE DOCS`
	// },
	// {
	// 	name: "5.6.10. Assessment of Declicker Efficacy",
	// 	path: `${ROOT}/5.6.10. Assessment of Declicker Efficacy/SOURCE DOCS`
	// },
	// {
	// 	name: "5.6.11. Assessment of Time-based Errors in Stethophone v3 Sound",
	// 	path: `${ROOT}/5.6.11. Assessment of Time-based Errors in Stethophone v3 Sound (dataset v3iPhxPsPt)/SOURCE DOCS`
	// },
	// {
	// 	name: "5.6.12. Assessment of informativeness of Stethophone v3 sound recorded by lay users",
	// 	path: `${ROOT}/5.6.12. Assessment of informativeness of Stethophone v3 sound recorded by lay users (dataset v3PtSelfx)/SOURCE DOCS`
	// },



]	

	 

const getIdFromFile =  data => data.name.replace(/(v3)(p[0-9]{2})(.*)/, "$2")
const getIdFromRecord =  data => data.patient_id.replace(/(v3)(p[0-9]{2})(.*)/, "$2")

const getValueFromFile = data => ( { value: sortBy(data.map(d => d.name)).join(",\n")})
const getValueFromRecord = data => ( { value: data.length +"  records" } )


const delay = ms => new Promise( resolve => {
	setTimeout(() => {resolve()}, ms)
})

const prepareFiles = async path => {
	let googleDrive = await googledriveService.create(path)
	return googleDrive	 
}


const getFileList = async prop => {
	console.log("File list for", prop.path)
	let drive = await prepareFiles(prop.path)
	return drive.fileList()
}

const getRecordList = async prop => {
	console.log("Record list", prop.report)
	let drive = await prepareFiles(path.dirname(prop.report))
	let file = drive.fileList(prop.report)[0]
	let data 

	if(file){
		console.log("Download", file.path)	
		await drive.downloadFiles({
			fs: TEMP,
			googleDrive: [file]
		})
		await delay(1000)
				
		try {
			data = loadJSON(`${TEMP}/${file.name}`)
		} catch (e) {
			data = loadJSON(`${TEMP}/${file.name}`)
		}
	}	

	return data || []
}

const getPropertyValues = async prop => {

	console.log(prop)

	let res

	if(prop.path) {
		res = await getFileList(prop)
	}	
	if(prop.report) {
		res = await getRecordList(prop)
	}	

	res = groupBy(res, (prop.getId) ? prop.getId : (prop.path) ? getIdFromFile : getIdFromRecord)
	res = keys(res).map( key => {
		let r = {
			patientId: key
		}

		r = extend({}, r, (prop.path) ? getValueFromFile(res[key]) : getValueFromRecord(res[key]))
		
		return r
	
	})

	return res	
}


const getPatientList = count => {
	let res = []
	for(let i=1; i<=count; i++){
		res.push(`p${i.toString().padStart(2,"0")}`)
	}
	return res
}


const run = async () => {

	let dataPool = {}

	for( let i=0; i < properties.length; i++ ){
		let property = properties[i]
		dataPool[property.name] = await getPropertyValues(property)
	}

	// console.log(dataPool)

	let result = getPatientList(62).map( p => {
		let res = {
			"patient ID": p
		}
		keys(dataPool).forEach( key => {
			let f = find(dataPool[key], v => v.patientId == p)
			if(f) {
				res[key] = f.value
			} else {
				res[key] = ""
			}
		})
		return res
	})

	console.log("Save xlsx", `${TEMP}/patient-files-auto.xlsx`)

	
	await saveXLSX(
		result,
		`${TEMP}/patient-files-auto.xlsx`,
		"data"
	)

	console.log("Upload", `${TEMP}/patient-files-auto.xlsx`, "into", `${MONITOR}`)
	let drive = await prepareFiles(ROOT)

	await drive.uploadFiles({
		fs: [`${TEMP}/patient-files-auto.xlsx`],
		googleDrive:`${MONITOR}`
	})
	
}

run()

