const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate, groupBy, keys, isString, last, uniqBy } = require("lodash")
const { loadJSON, unlink, filesize, files } = require("../utils/file-system")
const { saveXLSX,loadXLSX} = require("../utils/xlsx")
const path = require("path")
const moment = require("moment")
const axios = require("axios")


const GD_ROOT = "V3-PT-Validation-2024/RECORDINGS"
const FS_ROOT = "./data/v3/pt"
const RES_FILE = `./data/structures/V3-PT-Validation-2024/v3-pt-datasets.xlsx`


const SYNC_URL_V3 = "https://35h7sworkec6bwn3oxj4rvvjqe0bkhtn.lambda-url.us-east-1.on.aws/"
const DATASETS_V3 = require("../json/import-v3")

const SYNC_URL_V2 = "https://yod2yuiilfmxthu4j5jztidula0gonmi.lambda-url.eu-central-1.on.aws/"
const DATASETS_V2 = require("../json/import-v2")


const key2dataset =  data => {
	let mapper = {	
		"v3-pt-noisy-iph-declick-off": "v3NoisyDeclickOff",
		"v3-pt-noisy-iph-declick-on": "v3NoisyDeclickOn",
		"v3-pt-noisy-predicate-declick-off": "v2NoisyDeclickOff",
		"v3-pt-noisy-predicate-declick-on": "v2NoisyDeclickOn",
		"v3-pt-participant-iph-": "v3participantx",
		"v3-pt-participant-predicate-": "v2participantx",
		"v3-pt-pspt-iPhone": "v3iphxpspt",
		"v3-pt-pspt-predicate": "v2iph12pspt",
		"v3-pt-wn-iPhone": "v3iPhxWN",
		"v3-pt-wn-predicate": "v2iPh12WN",
		"v3-pt-self-iph-": " v3ptselfx"
	}

	let key = keys(mapper).filter( key => data.startsWith(key))[0]
	return mapper[key]

}



// const key2folder = data => {
// 	let mapper = {	
// 		"v3-pt-noisy-iph-declick-off": "v3NoisyDeclickOff",
// 		"v3-pt-noisy-iph-declick-on": "v3NoisyDeclickOn",
// 		"v3-pt-noisy-predicate-declick-off": "v2NoisyDeclickOff",
// 		"v3-pt-noisy-predicate-declick-on": "v2NoisyDeclickOn",
// 		"v3-pt-participant-iph-": "v3participantx",
// 		"v3-pt-participant-predicate-": "v2participantx",
// 		"v3-pt-pspt-iPhone": "v3iphxpspt",
// 		"v3-pt-pspt-predicate": "v2iph12pspt",
// 		"v3-pt-wn-iPhone": "v3iPhxWN",
// 		"v3-pt-wn-predicate": "v2iPh12WN"
// 	}

// 	let key = keys(mapper).filter( key => data.startsWith(key))[0]
// 	return mapper[key]

// }





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

	// await syncRecordsV2()
	// await syncRecordsV3()

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
		let data = require(file)
		data.forEach( d => {
			let key = ""
			d.dataset = key2dataset(d.patient_id)
			d.folder = key2dataset(d.patient_id)
			d.file_created_at = moment(d.file_created_at).format("DD MMM, HH:mm:ss")
			d.examination_modified_at = moment(d.examination_modified_at).format("DD MMM, HH:mm:ss")
			d.examination_created_at = moment(d.examination_created_at).format("DD MMM, HH:mm:ss")
		})
		res = res.concat(data)
	}

	res = sortBy(res, d => d.patient_id)

	let header = [
		"dataset",
		"folder",
		"patient_id",	
		"record_spot",	
		"file_id",	
		"file_created_at",	
		"is_fine",	
		"heart_rate",	
		"has_murmur",	
		"record_type",	
		"record_body_side",	
		"record_body_position",	
		"examination_id",	
		"examination_title",	
		"examination_notes",	
		"examination_created_at",	
		"examination_modified_at",	
		"segments",	
		"has_s3",	
		"has_s4"
	]

	await saveXLSX(
		res,
		RES_FILE,
		"data",
		header
	)


}




run()

