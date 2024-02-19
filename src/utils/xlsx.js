const xlsx = require("xlsx")
const path = require("path")
const { keys, values, uniq, isArray, isObject, flattenDeep, uniqBy, isUndefined } = require("lodash")
const { makeDir } = require("./file-system")
const moment = require("moment")

let newWb = () => xlsx.utils.book_new()

let loadXlsxWb = async (filename) => {
	let d = await xlsx.readFile(path.resolve(filename))
	return d
}

let wb2json = wb => {
	for(i in wb.Sheets){
		wb.Sheets[i] = xlsx.utils.sheet_to_json(wb.Sheets[i]);	
	}
	return wb.Sheets	
}

const loadXlsx = async (filename, sheet) => {
	let wb = await loadXlsxWb(path.resolve(filename))
	wb = wb2json(wb)

	return (sheet) ? wb[sheet]: wb
}

let aoa2ws = aoa => xlsx.utils.aoa_to_sheet(aoa)

let addWs = (wb, ws, ws_name) => {
	xlsx.utils.book_append_sheet(wb, ws, ws_name)
}

let writeXlsxWb = (wb, filename) => {
	xlsx.writeFile(wb, path.resolve(filename))
}	


const resolveFile = (filePath, defaultFilename) => {
	const d = path.parse(path.resolve(filePath))
	return (d.ext)
				?  filePath
				: `${filePath}/${defaultFilename}`
}


const saveXlsx = async (data, filename, sheet, header) => {
	
	if(!data) throw new Error('XLSX SAVE ERROR: Data must be not empty')
	
	
	sheet = sheet || "data"
	filename = filename || `./${moment(new Date()).format("YY-MM-DD-HH-mm-ss")}.xlsx`
	filename = path.resolve(filename)
	
	data = (isArray(data)) ? data : [data]
	
	if(data.length > 0){
	
		let res
	
		if(isArray(data[0])){
	
			res = data.map(d => [d])
	
		} else {
	
			if( isObject(data[0])){
				if(!header){
					header = uniqBy(flattenDeep(data.map(d => keys(d))))
				}	
				res = [header] //[keys(data[0])]
				data.forEach( d => {
					res.push(header.map( key => (!isUndefined(d[key])) ? d[key] : ""))
				})
	
			} else {
	
				res = [[data]]
	
			}
		}
		
		let wb = newWb()
		addWs(wb, aoa2ws(res), sheet)
		await makeDir(path.dirname(filename))
		writeXlsxWb(wb, filename)	
	
	} else {
	
		throw new Error('XLSX SAVE ERROR: Data must be array (not empty)')
	
	}
	
}



module.exports = {
	loadXlsx,
	loadXLSX: loadXlsx,
	saveXlsx,
	saveXLSX: saveXlsx,
	loadXlsxWb,
	wb2json,
	aoa2ws,
	writeXlsxWb,
	addWs,
	newWb
}