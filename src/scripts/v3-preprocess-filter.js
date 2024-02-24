const { extend, sortBy, find, truncate, groupBy, keys, isString, last } = require("lodash")
const { loadJSON, unlink, filesize } = require("../utils/file-system")
const { saveXLSX, loadXLSX } = require("../utils/xlsx")
const path = require("path")
const moment = require("moment")



const ST_XLSX = "./data/structures/V3-PT-Validation-2024/SPECTRA/v3-pt-filter-iph-spectra.xlsx"
const PR_XLSX = "./data/structures/V3-PT-Validation-2024/SPECTRA/v3-pt-filter-predicate-spectra.xlsx"


const RES_XLSX = "./data/structures/V3-PT-Validation-2024/SPECTRA/v3-pt-filter-processed.xlsx"


const parse = name => {
	let d = name.split(/[\-\.]/g)
	return {
		device: d[3],
		filter: d[4],
		recording: d[5]
	}
}


const run = async () => {

	let result = []

	let st_data = await loadXLSX(ST_XLSX, "data")

	st_data = st_data.map( d => {
		let p = parse(d.filename)	
		d.device = "iPhone 12"
		d.filter = p.filter
		d.record = p.record
		d.id = `${d.device}-${d.filter}`
		return d
	})

	let pr_data = await loadXLSX(PR_XLSX, "data")

	pr_data = pr_data.map( d => {
		let p = parse(d.filename)	
		d.device = "Predicate"
		d.filter = p.filter
		d.record = p.record
		d.id = `${d.device}-${d.filter}`
		return d
	})


	await saveXLSX( sortBy(st_data.concat(pr_data), r => r.id), RES_XLSX )
}




run()

