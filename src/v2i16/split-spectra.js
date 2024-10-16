const { extend, sortBy, find, truncate, groupBy, keys, isString, last, uniqBy } = require("lodash")
const path = require("path")
const fs = require("fs")

const tests = require("./datasets")
const data = require("./json/v2i16-spectra.json")
const metadata = require("./json/v2i16-datasets-report.json")

console.log("load", data.length, "items")

tests.forEach( test => {
	console.log(test.name)
	let regex = new RegExp(`/${test.name}/`)
	let testData = data.filter( d => regex.test(d.metadata.file))
	testData = testData.map( d => {
		let meta = find(metadata, m => (m.file_id+".wav") == path.basename(d.metadata.file)).patient_id.split("-")
		keys(test.select).forEach( key => {
			// console.log(key, test.select[key](meta))
			d[key] = test.select[key](meta)
		})
		return d 
	})
	console.log(testData.length, "items")
	fs.writeFileSync(`./src/v2i16/json/${test.name}.json`, JSON.stringify(testData, null, " "))
})

