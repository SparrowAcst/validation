const { extend } = require("lodash")
const { getSpectrum } = require("../utils/wav")
const {	getFileList } = require("../utils/file-system")

const wav2spectrum = async config => {

	console.log("wav2spectrum", config)

	let filelist = await getFileList(config.fs)
	
	// console.log("Inputs:", config.params.fs)
	// console.log(filelist)
	
	let res = filelist.map( file => {
		console.log(`Process ${file}`)
		let r = getSpectrum( file, extend({}, config.metadata, {file}), config.params)
		return r
	})

	return res	

}


module.exports = wav2spectrum