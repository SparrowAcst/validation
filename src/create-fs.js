const googledriveService = require("./utils/google-drive")
const { loadXLSX, saveXLSX } = require("./utils/xlsx")
const wav2spectrum  = require("./utils/wav2spectrum")
const { extend } = require("lodash")
const render = require("./utils/echarts")
const { mkdir, writeFile } = require("./utils/file-system")
const path = require("path")


// const ROOT = "./data/structures/V3-Stethophone-Validation-2024"
// const message = `Sthethophone v.3 Validation Test Data Partition`

// const run = async () => {


// 	let res = await loadXLSX(
// 		"./data/validation-file-structure.xlsx",
// 		"V3-ST-FORM-2024"
// 	)

// 	res = res.filter( d => d.type == "FOLDER")

// 	for( const dir of res ){
// 		let d = `${ROOT}${dir.path}`
// 		console.log(path.resolve(d))
// 		await mkdir(d)
// 		writeFile(`${d}/readme.txt`, message)
// 	}

// 	res = await loadXLSX(
// 		"./data/validation-file-structure.xlsx",
// 		"V3-ST-REC-2024"
// 	)

// 	res = res.filter( d => d.type == "FOLDER")

// 	for( const dir of res ){
// 		let d = `${ROOT}/!RECORDINGS/${dir.path}`
// 		console.log(path.resolve(d))
// 		await mkdir(d)
// 		writeFile(`${d}/readme.txt`, message)
// 	}

// }



// const ROOT = "./data/structures/V3-AI-Validation-2024"
// const message = `Sthethophone v.3 AI Validation Test Data Partition`

// const run = async () => {


// 	let res = await loadXLSX(
// 		"./data/validation-file-structure.xlsx",
// 		"V3-AI-2024"
// 	)

// 	res = res.filter( d => d.type == "FOLDER")

// 	for( const dir of res ){
// 		let d = `${ROOT}${dir.path}`
// 		console.log(path.resolve(d))
// 		await mkdir(d)
// 		writeFile(`${d}/readme.txt`, message)
// 	}
// }

// const ROOT = "./data/structures/V3-PT-Validation-2024"
// const message = `Sthethophone v.3 Performance Validation Test Data Partition`

// const run = async () => {


// 	let res = await loadXLSX(
// 		"./data/validation-file-structure.xlsx",
// 		"V3-PT-2024"
// 	)

// 	res = res.filter( d => d.type == "FOLDER")

// 	for( const dir of res ){
// 		let d = `${ROOT}/${dir.path}`
// 		console.log(path.resolve(d))
// 		await mkdir(d)
// 		writeFile(`${d}/readme.txt`, message)
// 	}
// }


const ROOT = "./data/structures/V3-RRT-Validation-2024"
const message = `Sthethophone v.3 Repetability and Reproducibility Validation Test Data Partition`

const run = async () => {


	let res = await loadXLSX(
		"./data/validation-file-structure.xlsx",
		"V3-RRT-2024"
	)

	res = res.filter( d => d.type == "FOLDER")

	for( const dir of res ){
		let d = `${ROOT}/${dir.path}`
		console.log(path.resolve(d))
		await mkdir(d)
		writeFile(`${d}/readme.txt`, message)
	}
}



run()

