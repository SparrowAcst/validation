const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate, groupBy, keys, isString, last, uniqBy } = require("lodash")
const { loadJSON, unlink, filesize, files } = require("../utils/file-system")
const { saveXLSX,loadXLSX} = require("../utils/xlsx")
const path = require("path")
const moment = require("moment")
const axios = require("axios")


const GD_ROOT = "V3-AI-Validation-2024/RECORDINGS"
const FS_ROOT = "./data/v2"
const RES_FILE = `./data/structures/V3-AI-Validation-2024/v3-ai-dataset-totals.xlsx`


const SYNC_URL = "https://35h7sworkec6bwn3oxj4rvvjqe0bkhtn.lambda-url.us-east-1.on.aws/"
const DATASETS = require("../json/import-v3")


const key2dataset = {
	"ambi": "v3qtyxambi",
	"cardiac": "v3qtyxcardiac",
	"arm": "v3qtyxarm",
	"cardiaccotton": "v3qtyxcardiaccotton",
	"cardiacwool": "v3qtyxcardiacwool",
	"dr": "v3pxdr",
	"self": "v3pxself",
	"ecg": "v3pxecg",
	"repeathr": "v3pxrepeathr"
}


const key2folder = {
	"ambi": "v3qtyxambi",
	"cardiac": "v3qtyxcardiac",
	"arm": "v3qtyxarm",
	"cardiaccotton": "v3qtyxcardiaccotton",
	"cardiacwool": "v3qtyxcardiacwool",
	"dr": "v3pxdr",
	"self": "v3pxself",
	"ecg": "v3pxecg",
	"repeathr": "v3pxrepeathr"
}

// const key2folder = {
// 	"ambi": "10.4.1. v3qtyxambi",
// 	"cardiac": "10.4.1. v3qtyxcardiac",
// 	"arm": "10.4.1. v3qtyxarm",
// 	"cardiaccotton": "10.4.1. v3qtyxcardiaccotton",
// 	"cardiacwool": "10.4.1. v3qtyxcardiacwool",
// 	"dr": "10.1.1. v3pxdr",
// 	"self": "10.7. v3pxself",
// 	"ecg": "10.2.1., 10.3.1. v3pxecg-iph",
// 	"repeathr": "10.5., 10.6. v3pxrepeathr-iph"
// }





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

	// let drive = await getDrive(GD_ROOT)
	// let gdlist = drive.fileList(`${GD_ROOT}/*/*.json`)
	// console.log(gdlist.map( d => d.name))

	// for( f of gdlist){
		
	// 	console.log("Download", f.path)	
			
	// 	await drive.downloadFiles({
	// 		fs: FS_ROOT,
	// 		googleDrive: [f]
	// 	})
			
	// }

	// let filelist = await files("./data/v3/ai/*.json")
	
	// console.log(filelist)

	// let res = []

	// for(file of filelist){
	// 	let data = require(file)
	// 	data.forEach( d => {
	// 		d.dataset = key2dataset[d.patient_id.split("-")[2]]
	// 		d.folder = key2folder[d.patient_id.split("-")[2]]
	// 		d.file_created_at = moment(d.file_created_at).format("DD MMM, HH:mm:ss")
	// 		d.examination_modified_at = moment(d.examination_modified_at).format("DD MMM, HH:mm:ss")
	// 		d.examination_created_at = moment(d.examination_created_at).format("DD MMM, HH:mm:ss")
	// 	})
	// 	res = res.concat(data)
	// }

	// res = sortBy(res, d => d.patient_id)

	// let header = [
	// 	"dataset",
	// 	"folder",
	// 	"patient_id",	
	// 	"record_spot",	
	// 	"file_id",	
	// 	"file_created_at",	
	// 	"is_fine",	
	// 	"heart_rate",	
	// 	"has_murmur",	
	// 	"record_type",	
	// 	"record_body_side",	
	// 	"record_body_position",	
	// 	"examination_id",	
	// 	"examination_title",	
	// 	"examination_notes",	
	// 	"examination_created_at",	
	// 	"examination_modified_at",	
	// 	"segments",	
	// 	"has_s3",	
	// 	"has_s4"
	// ]

	// await saveXLSX(
	// 	res,
	// 	"./data/structures/V3-AI-Validation-2024/v3-ai-datasets.xlsx",
	// 	"data",
	// 	header
	// )


}




run()

