const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate, groupBy, keys } = require("lodash")
const { loadJSON, unlink } = require("../utils/file-system")
const { saveXLSX, loadXLSX } = require("../utils/xlsx")
const path = require("path")


const ROOT = "V3-VALIDATION-TEST-DATA"
const MONITOR = `${ROOT}/!MONITOR`


const forms = [
	{
		name: "5.5.1.5.1. R-R intervals",
		n: "5.5.1.5.1.",
		path: `${ROOT}/5.5.1.5.1. Simultaneous recording of heart sound and ECG (dataset V3PxECG)/Eko CORE 500/R-R intervals`,
		alt: `${ROOT}/5.5.1.5.1. Simultaneous recording of heart sound and ECG (dataset V3PxECG)/Eko CORE 500/R-R intervals.xlsx`,
	
	},
	{
		name: "5.6.1. Assessment of patients’ heart murmur by experts",
		n: "5.6.1.",
		path: `${ROOT}/5.6.1. Assessment of patients’ heart murmur by experts (dataset V3PxDr, recordings made by Eko CORE 500)/Assessment of patients’ heart murmur by experts`,
		alt: `${ROOT}/5.6.1. Assessment of patients’ heart murmur by experts (dataset V3PxDr, recordings made by Eko CORE 500)/Assessment of patients’ heart murmur by experts.xlsx`,
		
		scans: `${ROOT}/5.6.1. Assessment of patients’ heart murmur by experts (dataset V3PxDr, recordings made by Eko CORE 500)/SOURCE DOCS`
		
	},
	{
		name: "5.6.2. Assessment of patients’ heart murmur by experts",
		n: "5.6.2.",
		path: `${ROOT}/5.6.2. Experts assessment of informativeness of Stethophone’s heart sound analysis algorithm for recordings made by lay users (dataset v3PxSelf)/Experts assessment of informativeness of Stethophone’s heart sound analysis algorithm`,
		alt: `${ROOT}/5.6.2. Experts assessment of informativeness of Stethophone’s heart sound analysis algorithm for recordings made by lay users (dataset v3PxSelf)/Experts assessment of informativeness of Stethophone’s heart sound analysis algorithm.xlsx`,
		
		scans: `${ROOT}/5.6.2. Experts assessment of informativeness of Stethophone’s heart sound analysis algorithm for recordings made by lay users (dataset v3PxSelf)/SOURCE DOCS`
		
	},
	{
		name: "5.6.3. Validation of heart sound quality assessment by Stethophone v3 in pseudo clinical environment",
		n: "5.6.3.",
		path: `${ROOT}/5.6.3. Validation of heart sound quality assessment by Stethophone v3 in pseudo clinical environment/Validation of heart sound quality assessment by Stethophone v3 in pseudo clinical environment`,
		alt: `${ROOT}/5.6.3. Validation of heart sound quality assessment by Stethophone v3 in pseudo clinical environment/Validation of heart sound quality assessment by Stethophone v3 in pseudo clinical environment.xlsx`,
	
		scans: `${ROOT}/5.6.3. Validation of heart sound quality assessment by Stethophone v3 in pseudo clinical environment/SOURCE DOCS`
	},
	{
		name: "5.6.4. Validation of Loudness of the Chest Sound Provided by Stethophone v3.0.0",
		n: "5.6.4.",
		path: `${ROOT}/5.6.4. Loudness of Stethophone v3 Sound Assessment/Validation of Loudness of the Chest Sound Provided by Stethophone v3.0.0`,
		alt: `${ROOT}/5.6.4. Loudness of Stethophone v3 Sound Assessment/Validation of Loudness of the Chest Sound Provided by Stethophone v3.0.0.xlsx`,
		
		scans: `${ROOT}/5.6.4. Loudness of Stethophone v3 Sound Assessment/SOURCE DOCS`
	},
	{
		name: "5.6.5. Assess frequency spectra of Stethophone v3.0.0 sound",
		n: "5.6.5.",
		path: `${ROOT}/5.6.5. Frequency Spectrum of Stethophone v3 Sound Assessment (dataset v3Patientx)/Assess frequency spectra of Stethophone v3.0.0 sound`,
		scans: `${ROOT}/5.6.5. Frequency Spectrum of Stethophone v3 Sound Assessment (dataset v3Patientx)/SOURCE DOCS`
	},
	{
		name: "5.6.6. Temporal Acoustic Resolution Validation of Stethophone v3.0.0 by Auscultation",
		n: "5.6.6.",
		path: `${ROOT}/5.6.6. Temporal Acoustic Resolution Validation by Auscultation (dataset v3Patientx)/Temporal Acoustic Resolution Validation of Stethophone v3.0.0 by Auscultation`,
		alt: `${ROOT}/5.6.6. Temporal Acoustic Resolution Validation by Auscultation (dataset v3Patientx)/Temporal Acoustic Resolution Validation of Stethophone v3.0.0 by Auscultation.xlsx`,
		
		scans: `${ROOT}/5.6.6. Temporal Acoustic Resolution Validation by Auscultation (dataset v3Patientx)/SOURCE DOCS`
	},
	{
		name: "5.6.7. Assessment of Chest Sound Distortion",
		n: "5.6.7.",
		path: `${ROOT}/5.6.7. Assessment of Chest Sound Distortion (dataset v3iPhxPsPt)/Assessment of Chest Sound Distortion`,
		alt: `${ROOT}/5.6.7. Assessment of Chest Sound Distortion (dataset v3iPhxPsPt)/Assessment of Chest Sound Distortion.xlsx`,
		
		scans: `${ROOT}/5.6.7. Assessment of Chest Sound Distortion (dataset v3iPhxPsPt)/SOURCE DOCS`
	},
	{
		name: "5.6.8. Assessment of Internal Hardware Noise in Stethophone v3 Sound",
		n: "5.6.8.",
		path: `${ROOT}/5.6.8. Assessment of Internal Hardware Noise in Stethophone v3 Sound (dataset v3iPhxPsPt)/Assessment of Internal Hardware Noise in Stethophone v3 Sound`,
		alt: `${ROOT}/5.6.8. Assessment of Internal Hardware Noise in Stethophone v3 Sound (dataset v3iPhxPsPt)/Assessment of Internal Hardware Noise in Stethophone v3 Sound.xlsx`,
		
		scans: `${ROOT}/5.6.8. Assessment of Internal Hardware Noise in Stethophone v3 Sound (dataset v3iPhxPsPt)/SOURCE DOCS`
	},
	{
		name: "5.6.9. Assessment of Informativeness of Oscillograms and Spectrograms of Stethophone v3",
		n: "5.6.9.",
		path: `${ROOT}/5.6.9. Informativeness of Oscillograms and Spectrograms of Stethophone v3 Assessment (dataset v3Patientx)/Assessment of Informativeness of Oscillograms and Spectrograms of Stethophone v3`,
		scans: `${ROOT}/5.6.9. Informativeness of Oscillograms and Spectrograms of Stethophone v3 Assessment (dataset v3Patientx)/SOURCE DOCS`
	},
	{
		name: "5.6.10. Assessment of Declicker Efficacy",
		n: "5.6.10.",
		path: `${ROOT}/5.6.10. Assessment of Declicker Efficacy/Assessment of Declicker Efficacy`,
		alt: `${ROOT}/5.6.10. Assessment of Declicker Efficacy/Assessment of Declicker Efficacy.xlsx`,
		
		scans: `${ROOT}/5.6.10. Assessment of Declicker Efficacy/SOURCE DOCS`
	},
	{
		name: "5.6.11. Assessment of Time-based Errors in Stethophone v3 Sound",
		n: "5.6.11.",
		path: `${ROOT}/5.6.11. Assessment of Time-based Errors in Stethophone v3 Sound (dataset v3iPhxPsPt)/Assessment of Time-based Errors in Stethophone v3 Sound`,
		alt: `${ROOT}/5.6.11. Assessment of Time-based Errors in Stethophone v3 Sound (dataset v3iPhxPsPt)/Assessment of Time-based Errors in Stethophone v3 Sound.xlsx`,
		
		scans: `${ROOT}/5.6.11. Assessment of Time-based Errors in Stethophone v3 Sound (dataset v3iPhxPsPt)/SOURCE DOCS`
	},
	{
		name: "5.6.12. Assessment of informativeness of Stethophone v3 sound recorded by lay users",
		n: "5.6.12.",
		path: `${ROOT}/5.6.12. Assessment of informativeness of Stethophone v3 sound recorded by lay users (dataset v3PtSelfx)/Assessment of informativeness of Stethophone v3 sound recorded by lay users`,
		alt: `${ROOT}/5.6.12. Assessment of informativeness of Stethophone v3 sound recorded by lay users (dataset v3PtSelfx)/Assessment of informativeness of Stethophone v3 sound recorded by lay users.xlsx`,
		
		scans: `${ROOT}/5.6.12. Assessment of informativeness of Stethophone v3 sound recorded by lay users (dataset v3PtSelfx)/SOURCE DOCS`
	},

]

const TEMP = "./.temp"

const delay = ms => new Promise( resolve => {
	setTimeout(() => {resolve()}, ms)
})

const prepareFiles = async path => {
	let googleDrive = await googledriveService.create(path)
	return googleDrive	 
}

const statistic = (property, data) => {
	let g = groupBy(data, d => d[property])
	let value = keys(g).map( key => `"${key}": ${g[key].length}`).join(", ")
	return {
		property,
		value
	}
}


const checkForm = async (drive, form) => {

	console.log(`Check "${form.name}"`)
	
	let file = drive.fileList(form.path)[0] || drive.fileList(form.alt)[0]
	
	if (file) {

		console.log("Download", file.path)	
		await drive.downloadFiles({
			fs: TEMP,
			googleDrive: [file]
		})
		await delay(1000)

		let filename = `${TEMP}/${file.name}${(file.name.endsWith(".xlsx")) ? "" : ".xlsx"}`

		console.log("Load XLSX", filename)	
		

		let data = await loadXLSX(
			filename,
			"data"
		)
		
		await unlink(filename)
		let scans = "N/A"
		if(form.scans){
			let d = await prepareFiles(form.scans)
			scans = d.fileList().length		
		}
				
		return {
			form: form.name,
			records: data.length,
			scans,
			path: form.path, 
			"scans path": form.scans
		}
	}
}



const run = async () => {

	let monitorData = []

	let drive = await prepareFiles(ROOT)

	for( let i=0; i< forms.length; i++){
		let form = forms[i]
		monitorData.push((await checkForm(drive, form)))
	}

	monitorData = monitorData.filter(d => d)


	await saveXLSX(
		monitorData,
		`${TEMP}/forms.xlsx`,
		"data"
	)

	await drive.uploadFiles({
		fs: [`${TEMP}/forms.xlsx`],
		googleDrive:`${MONITOR}`
	})

	await unlink(`${TEMP}/forms.xlsx`)
	
	
}

run()

