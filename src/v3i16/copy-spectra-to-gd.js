const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate, groupBy, keys, isString, last, uniqBy } = require("lodash")
const { loadJSON, unlink, filesize } = require("../utils/file-system")
const { saveXLSX,loadXLSX} = require("../utils/xlsx")
const path = require("path")
const moment = require("moment")
const wav2spectrum  = require("../utils/wav2spectrum")
const fs = require("fs")

const ROOT = "V3-I16-2024/Spectra"

const prepareFiles = async path => {
	let googleDrive = await googledriveService.create(path)
	return googleDrive	 
}

const pathToSpectra = process.argv[2] || "v3i16-spectra.json"

const run = async () => {
	
	let drive = await prepareFiles(ROOT)
	
	let res = await drive.uploadFile(
		`../v3i16/${pathToSpectra}`,
		ROOT,
		progress => { console.log(progress) },
		true
	)
}

run()

