const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate, groupBy, keys, isString, last, uniqBy } = require("lodash")
const { loadJSON, unlink, filesize } = require("../utils/file-system")
const { saveXLSX,loadXLSX} = require("../utils/xlsx")
const path = require("path")
const moment = require("moment")
const wav2spectrum  = require("../utils/wav2spectrum")

const TEMP_WAV_DIR = "../v3i16/"

const datasets = require("./datasets")

const prepareFiles = async path => {
	let googleDrive = await googledriveService.create(path)
	return googleDrive	 
}

const downloadWavs = async (pathToWavs, fs) => {
	let drive = await prepareFiles(pathToWavs.split("/").slice(0,-1).join("/"))
	let googleDrive = drive.fileList()
	console.log(googleDrive.map( d => d.name))
	await drive.downloadFiles({googleDrive, fs})
}




const run = async () => {
	let operations = datasets.map( d => {
		let pathToWavs = `${d.metadata.split("/").slice(0,-1).filter(d => d).join("/")}/raw`
		return {
			source: `V3-I16-2024/${pathToWavs}/*.wav`,
			target: path.resolve(`${TEMP_WAV_DIR}${pathToWavs}`) 
		}
	})

	for( let o of operations){
		console.log(o)
		await downloadWavs(o.source, o.target)
	}
}




run()

