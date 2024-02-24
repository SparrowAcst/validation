const { extend, sortBy, find, truncate, groupBy, keys, isString, last } = require("lodash")
const { loadJSON, unlink, filesize } = require("../utils/file-system")
const { loadXLSX, saveXLSX } = require("../utils/xlsx")
const path = require("path")
const moment = require("moment")


let dataSources = [
	{
		xlsx: "./data/structures/V3-PT-Validation-2024/SPECTRA/v3-pt-participant-iph-spectra.xlsx",
		json: "./data/v3/pt/v3-pt-participant-iph.json"
	},
	{
		xlsx: "./data/structures/V3-PT-Validation-2024/SPECTRA/v3-pt-participant-predicate-spectra.xlsx",
		json: "./data/v3/pt/v3-pt-participant-predicate.json"
	}
]



const RES_XLSX = "./data/structures/V3-PT-Validation-2024/SPECTRA/v3-pt-participant-processed.xlsx"



const getDevice = name => {
	let a = name.split("-")
	let res = a[3]
		// (a[2].startsWith("iPhone") || a[2].startsWith("predicate") || a[2].startsWith("mic")) ? a[2] : undefined
	return res	
}


const run = async () => {

	let result = []
	
	for( let dataSource of dataSources){

		 console.log(dataSource)

		 let spectraData = await loadXLSX(dataSource.xlsx, "data")
		 let metaData = await loadJSON(dataSource.json)

		 spectraData.forEach( row => {
		 	let f = find(metaData, m => `${m.file_id}.wav` == row.filename)
		 	if(f){
		 		row.device = (getDevice(f.patient_id) == "iph") ? "Stethophone v3" : "Predicate"
		 		row.spot = f.record_spot
		 		row.id = `${row.device}-${row.spot}`
		 		// row.os = device2os[row.device],
		 		// row.release = device2release[row.device]
		 	} else {
		 		console.log(`No metadata for ${row.filename}`)
		 		console.log(metaData.map(m => `${m.file_id}.wav`))
		 	}

		 })

		 result = result.concat(spectraData)
	}

	await saveXLSX( sortBy(result, r => r.device), RES_XLSX)

}

run()

