const { extend, sortBy, find, truncate, groupBy, keys, isString, last } = require("lodash")
const { loadJSON, unlink, filesize } = require("../utils/file-system")
const { loadXLSX, saveXLSX } = require("../utils/xlsx")
const path = require("path")
const moment = require("moment")


let dataSources = [
	{
		xlsx: "./data/structures/V3-RRT-Validation-2024/SPECTRA/v3-rrt-operators-iph-spectra.xlsx",
		json: "./data/v3/rrt/v3-rrt-operators-iph.json"
	},
	{
		xlsx: "./data/structures/V3-RRT-Validation-2024/SPECTRA/v3-rrt-operators-spectra.xlsx",
		json: "./data/v3/rrt/v3-rrt-operators-predicate.json"
	}
]



const RES_XLSX = "./data/structures/V3-RRT-Validation-2024/SPECTRA/v3-operators-processed.xlsx"


const device2os = {

"iPhone 6s": 					15,
"iPhone 6s Plus": 				15,
"iPhone 7": 					15,
"iPhone 7 Plus": 				15,
"iPhone 8": 					16,
"iPhone 8 Plus": 				15,
"iPhone SE (1st generation)": 	15,
"iPhone SE (2nd generation)": 	16,
"iPhone X": 					15,
"iPhone XR": 					16,
"iPhone XS": 					16,
"iPhone XS Max": 				16,
"iPhone 11": 					16,
"iPhone 11 Pro": 				17,
"iPhone 11 Pro Max": 			16,
"iPhone 12": 					16,
"iPhone 12 Mini": 				16,
"iPhone 12 Pro": 				16,
"iPhone 12 Pro Max": 			16,
"iPhone 13": 					15,
"iPhone 13 Mini": 				16,
"iPhone 13 Pro": 				16,
"iPhone 13 Pro Max": 			15,
"iPhone 14": 					16,
"iPhone 14 Plus": 				16,
"iPhone 14 Pro": 				16,
"iPhone 14 Pro Max": 			16,
"iPhone SE (3d generation)": 	16,
"iPhone 15": 					17,
"iPhone 15 Plus": 				17,
"iPhone 15 Pro": 				17,
"iPhone 15 Pro Max": 			17

}

// const device2release = {

// "iPhone 6s": 					2014,
// "iPhone 6s Plus": 				2014,
// "iPhone 7": 					2016,
// "iPhone 7 Plus": 				2016,
// "iPhone 8": 					2017,
// "iPhone 8 Plus": 				2017,
// "iPhone SE (1st generation)": 	2016,
// "iPhone SE (2nd generation)": 	2020,
// "iPhone X": 					2017,
// "iPhone XR": 					2018,
// "iPhone XS": 					2018,
// "iPhone XS Max": 				2018,
// "iPhone 11": 					2019,
// "iPhone 11 Pro": 				2019,
// "iPhone 11 Pro Max": 			2019,
// "iPhone 12": 					2020,
// "iPhone 12 Mini": 				2020,
// "iPhone 12 Pro": 				2020,
// "iPhone 12 Pro Max": 			2020,
// "iPhone 13": 					2021,
// "iPhone 13 Mini": 				2021,
// "iPhone 13 Pro": 				2021,
// "iPhone 13 Pro Max": 			2021,
// "iPhone 14": 					2022,
// "iPhone 14 Plus": 				2022,
// "iPhone 14 Pro": 				2022,
// "iPhone 14 Pro Max": 			2022,
// "iPhone SE (3d generation)": 	2022,
// "iPhone 15": 					2023,
// "iPhone 15 Plus": 				2023,
// "iPhone 15 Pro": 				2023,
// "iPhone 15 Pro Max": 			2023

// }

const device2release = {

"iPhone 6s": 					"2014-2017",
"iPhone 6s Plus": 				"2014-2017",
"iPhone 7": 					"2014-2017",
"iPhone 7 Plus": 				"2014-2017",
"iPhone 8": 					"2014-2017",
"iPhone 8 Plus": 				"2014-2017",
"iPhone SE (1st generation)": 	"2014-2017",
"iPhone SE (2nd generation)": 	"2018-2020",
"iPhone X": 					"2014-2017",
"iPhone XR": 					"2018-2020",
"iPhone XS": 					"2018-2020",
"iPhone XS Max": 				"2018-2020",
"iPhone 11": 					"2018-2020",
"iPhone 11 Pro": 				"2018-2020",
"iPhone 11 Pro Max": 			"2018-2020",
"iPhone 12": 					"2018-2020",
"iPhone 12 Mini": 				"2018-2020",
"iPhone 12 Pro": 				"2018-2020",
"iPhone 12 Pro Max": 			"2018-2020",
"iPhone 13": 					"2021-2023",
"iPhone 13 Mini": 				"2021-2023",
"iPhone 13 Pro": 				"2021-2023",
"iPhone 13 Pro Max": 			"2021-2023",
"iPhone 14": 					"2021-2023",
"iPhone 14 Plus": 				"2021-2023",
"iPhone 14 Pro": 				"2021-2023",
"iPhone 14 Pro Max": 			"2021-2023",
"iPhone SE (3d generation)": 	"2021-2023",
"iPhone 15": 					"2021-2023",
"iPhone 15 Plus": 				"2021-2023",
"iPhone 15 Pro": 				"2021-2023",
"iPhone 15 Pro Max": 			"2021-2023"

}





const getDevice = name => {
	let a = name.split("-")
	let res = a[3]

		// (a[2].startsWith("iPhone") || a[2].startsWith("predicate") || a[2].startsWith("mic")) ? a[2] : undefined
	return {
		device: a[3],
		operator: a[4]

	}		
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
		 		
		 		row.device = getDevice(f.patient_id).device
		 		row.operator = getDevice(f.patient_id).operator
		 		row.type = f.record_type
		 		row.id = `${row.device}-${row.type}`
		 		row.os = device2os[row.device],
		 		row.release = device2release[row.device]

		 	} else {
		 		console.log(`No metadata for ${row.filename}`)
		 		console.log(metaData.map(m => `${m.file_id}.wav`))
		 	}

		 })

		 result = result.concat(spectraData)
	}

	await saveXLSX( 
		sortBy(
			sortBy( result.filter( r => r.id), r => r.device), 
			r => r.type
		), 
		RES_XLSX
	)

}

run()

