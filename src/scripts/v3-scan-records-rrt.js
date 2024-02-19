const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate, groupBy, keys, isString, last, uniqBy } = require("lodash")
const { loadJSON, unlink, filesize, files } = require("../utils/file-system")
const { saveXLSX,loadXLSX} = require("../utils/xlsx")
const path = require("path")
const moment = require("moment")
const axios = require("axios")


const GD_ROOT = "V3-RRT-Validation-2024/RECORDINGS"
const FS_ROOT = "./data/v3/rrt"
const RES_FILE = `./data/structures/V3-RRT-Validation-2024/v3-rrt-dataset-totals.xlsx`


const SYNC_URL_V3 = "https://35h7sworkec6bwn3oxj4rvvjqe0bkhtn.lambda-url.us-east-1.on.aws/"
const DATASETS_V3 = require("../json/import-v3")

const SYNC_URL_V2 = "https://yod2yuiilfmxthu4j5jztidula0gonmi.lambda-url.eu-central-1.on.aws/"
const DATASETS_V2 = require("../json/import-v2")


const getDrive = async path => {
	let googleDrive = await googledriveService.create(path)
	return googleDrive	 
}


const syncRecordsV3 = async () => {

	console.log("Sync records", DATASETS_V3.map( d => d.folder))
	
	let response = await axios.post(
		SYNC_URL_V3,
		{
			query: DATASETS_V3
		}
	)
	
	console.log(response.data)
	
	return response.data

}

const syncRecordsV2 = async () => {

	console.log("Sync records", DATASETS_V2.map( d => d.folder))
	
	let response = await axios.post(
		SYNC_URL_V2,
		{
			query: DATASETS_V2
		}
	)
	
	console.log(response.data)
	
	return response.data

}

const run = async () => {

	await syncRecordsV2()
	await syncRecordsV3()

	let drive = await getDrive(GD_ROOT)
	let gdlist = drive.fileList(`${GD_ROOT}/*/*.json`)
	console.log(gdlist.map( d => d.name))

	for( f of gdlist){
		
		console.log("Download", f.path)	
			
		await drive.downloadFiles({
			fs: FS_ROOT,
			googleDrive: [f]
		})
			
	}

	let filelist = await files(`${FS_ROOT}/*.json`)
	
	console.log(filelist)

	let res = []

	for(file of filelist){
		res = res.concat(require(file))
	}

	res = sortBy(res, d => d.patient_id)

	if( res.length > 0){
		await saveXLSX( res, RES_FILE)	
	} else {
		console.log("No data available")
	}
	


}




run()

