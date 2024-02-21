const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate, groupBy, keys, isString, last } = require("lodash")
const { loadJSON, unlink, filesize, mkdir, rmdir, exists, saveJSON, unzip, getFileList } = require("../utils/file-system")
const { saveXLSX } = require("../utils/xlsx")
const path = require("path")
const moment = require("moment")
const wav2waveform  = require("../utils/wav2waveform")


const TEMP = "./.temp/sp"

const delay = ms => new Promise( resolve => {
	setTimeout(() => {resolve()}, ms)
})

const prepareFiles = async path => {
	let googleDrive = await googledriveService.create(path)
	return googleDrive	 
}



const run = async options => {
	
	if(!(await exists(`${TEMP}`))){
		await mkdir(`${TEMP}`)	
	}

	if(!(await exists(`${TEMP}/wav`))){
		await mkdir(`${TEMP}/wav`)
	}	
	
	if(!(await exists(`${TEMP}/spectra`))){
		await mkdir(`${TEMP}/spectra`)
	}	
	
	
	console.log(`Download files from ${options.source}`)
	
	let sourceDrive = await prepareFiles(options.source)
		
	await sourceDrive.downloadFiles({
		googleDrive:sourceDrive.fileList(),
		fs: `${TEMP}/wav`
	})
	
	console.log("Unzip")
	let filelist = getFileList(`${TEMP}/wav/*.zip`)
	for( let f of filelist){
		await unzip()
	}
		
	
	console.log("Build waveform")
	
	let res = await wav2waveform({
		fs: `${TEMP}/wav/*.wav`,
		metadata: { message: ""}, 
		params: { tick: 0.01} 
	})

	res = res.map( r => {
		return extend({
			filename: r.metadata.fileName
		}, r.waveform)
	})


	saveJSON(`${TEMP}/spectra/${path.basename(options.dest)}`, res)

	// await saveXLSX(
	// 	res,
	// 	`${TEMP}/spectra/${path.basename(options.dest)}`
	// )

	console.log(`Upload into ${options.dest}`)
	
	let destDrive = await prepareFiles(path.dirname(options.dest))

	await destDrive.uploadFiles({
		fs: [`${TEMP}/spectra/${path.basename(options.dest)}`],
		googleDrive: path.dirname(options.dest)
	})

	await rmdir(`${TEMP}/wav`)
	// await rmdir(`${TEMP}/spectra`)
			

	console.log("Complete")	

}		



const validateOptions = options => {
	
	let res = []
	
	if(!options.source){
		res.push("empty source")
	}
	
	if(!options.dest){
		res.push("empty destination")
	}
	
	if(!options.dest.endsWith(".json")){
		res.push("destination is no json file")
	}
	
	res.push((res.length == 0) ? true : "throw execution")

	return (res.length == 1 && res[0] == true) ? true : res.join("\n")

}


// console.log(process.argv.slice(2))

var options = require('yargs/yargs')(process.argv.slice(2))
    .option('s', {
        alias: 'source',
        demandOption: true,
        default: '',
        describe: 'path to source wav files',
        type: 'string'
    })
    .option('d', {
        alias: 'dest',
        demandOption: true,
        default: '',
        describe: 'path to dest xlsx file',
        type: 'string'
    })
    .argv

let validation = validateOptions(options)

if(validation == true) {
	console.log("Build spactra utility starts")
	run(options)	
} else {
	console.log(validation)
}

