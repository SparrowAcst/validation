const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate, groupBy, keys, isString, last, uniqBy } = require("lodash")
const { loadJSON, unlink, filesize, files } = require("../utils/file-system")
const { saveXLSX,loadXLSX} = require("../utils/xlsx")
const path = require("path")
const moment = require("moment")
const axios = require("axios")


const GD_ROOT = "V3-AI-Validation-2024/RECORDINGS"
const FS_ROOT = "./data/v3/ai"
const RES_FILE = `./data/structures/V3-AI-Validation-2024/v3-ai-dataset-totals.xlsx`


const SYNC_URL = "https://35h7sworkec6bwn3oxj4rvvjqe0bkhtn.lambda-url.us-east-1.on.aws/"
const DATASETS = require("../json/import-v3")


const getDrive = async path => {
	let googleDrive = await googledriveService.create(path)
	return googleDrive	 
}


const syncRecords = async () => {

	console.log("Sync records", DATASETS.map( d => d.folder))
	
	let response = await axios.post(
		SYNC_URL,
		{
			query: DATASETS
		}
	)
	
	console.log(response.data)
	
	return response.data

}


const run = async () => {

	await syncRecords()

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

	let filelist = await files("./data/v3/ai/*.json")
	
	console.log(filelist)

	let res = []

	for(file of filelist){
		res = res.concat(require(file))
	}

	res = sortBy(res, d => d.patient_id)

	await saveXLSX(
		res,
		"./data/structures/V3-AI-Validation-2024/v3-dataset-totals.xlsx"
	)


}




run()

