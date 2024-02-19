const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate, groupBy, keys, isString, last } = require("lodash")
const { loadJSON, unlink, filesize } = require("../utils/file-system")
const { saveXLSX, loadXLSX } = require("../utils/xlsx")
const path = require("path")
const moment = require("moment")
const wav2spectrum  = require("../utils/wav2spectrum")


const ROOT = "./data/structures/V3-PT-Validation-2024/TRY"
const sets = [
	"v3-try-v2",
	"v3-try-v3"
]

const run = async () => {
	let res = []
		
	for(let set of sets){
		let metadata = await loadJSON(`${ROOT}/${set}.json`)
		let spectrum = await loadXLSX(`${ROOT}/${set}.xlsx`,"data")
	
		metadata.forEach( m => {
			let f = find(spectrum, s => {
				// console.log(`${m.file_id}.wav`,s.filename, `${m.file_id}.wav` == s.filename)
				return `${m.file_id}.wav` == s.filename
			})
			let version = m.patient_id.split("-")[0]
			let device = (version == "v2") ? last(m.patient_id.split("-")) : m.patient_id.split("-").slice(-2).join("-")
			let id = `${version}.${device}`
			// console.log(id, `${m.file_id}.wav`)
			res.push(extend({id, version, device }, f))
		})
	}

	await saveXLSX(
		sortBy(res, r => r.device),
		"./data/structures/V3-PT-Validation-2024/SPECTRA/v3-try-2024.xlsx"
	)

}




run()

