const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate, groupBy, keys, isString, last, uniqBy } = require("lodash")
const { loadJSON, unlink, filesize } = require("../utils/file-system")
const { saveXLSX,loadXLSX} = require("../utils/xlsx")
const path = require("path")
const moment = require("moment")
const wav2spectrum  = require("../utils/wav2spectrum")
const fs = require("fs")

const TEMP_WAV_DIR = "../v2i16/"


const pathToWavs = process.argv[2] || "**/*.wav"
const pathToRes = process.argv[3] || "v2i16-spectra.json"


const run = async () => {

	let res = await wav2spectrum({
		fs: `${TEMP_WAV_DIR}/${pathToWavs}`,
		metadata: {}, 
		params: { frequency:{range: [0, 2000]}} 
	})

	fs.writeFileSync(`${TEMP_WAV_DIR}/${pathToRes}`, JSON.stringify(res))

}

run()

