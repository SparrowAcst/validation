
const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate, groupBy, keys, isString, last, uniqBy } = require("lodash")
const path = require("path")

// const ROOT = "V3-VALIDATION-TEST-DATA/RECORDINGS"
const ROOT = "V2-I16-2024"

const TEMP = "./src/v2i16/json"
const TESTS = require("./datasets")

const delay = ms => new Promise( resolve => {
	setTimeout(() => {resolve()}, ms)
})

const prepareFiles = async path => {
	let googleDrive = await googledriveService.create(path)
	return googleDrive	 
}

const downloadMeta = async () => {
	
	
	for( let t of TESTS){

		let drive = await prepareFiles(`${ROOT}/${path.dirname(t.metadata)}`)
		
		let file = drive.fileList(`${ROOT}/${t.metadata}`)[0]
		
		if(!file) {
			console.log(`${ROOT}/${t.metadata} NOT FOUND`)
			continue
		}
		console.log("Download", file.path)	
		
		await drive.downloadFiles({
		    fs: TEMP,
		    googleDrive: [file]
		})
		
		await delay(1000)
		console.log(`${TEMP}/${file.name} done`)	
				
	}
}

const run = async () => {
	await downloadMeta()
}


run()

