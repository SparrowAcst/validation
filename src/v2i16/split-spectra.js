const { extend, sortBy, find, truncate, groupBy, keys, isString, last, uniqBy } = require("lodash")
const path = require("path")
const fs = require("fs")


let pathToData = process.argv[2] || "v2i16-spectra"

let pattern = process.argv[3] || ""

if(pattern){
	pattern = new RegExp(`${pattern}`)
}

console.log(pattern)

const tests = require("./datasets")
				.filter(t => t.select || t.fromPath)
				.filter( t => pattern.test(t.name))

const data = require(`./json/${pathToData}.json`)
const metadata = require("./json/v2i16-datasets-report.json")

console.log("load", data.length, "items")





tests.forEach( test => {
	console.log(test.name)
	let regex = new RegExp(`/${test.name}/`)
	let testData = data.filter( d => regex.test(d.metadata.file))
	testData = testData.map( d => {
		let meta = find(metadata, m => (m.file_id+".wav") == path.basename(d.metadata.file))
		if(meta){
			meta = meta.patient_id.split("-")
			keys(test.select).forEach( key => {
				// console.log(key, test.select[key](meta))
				d[key] = test.select[key](meta)
			})
			return d 
		}
		meta = d.metadata.file.split("/")
		keys(test.fromPath).forEach( key => {
			// console.log(key, test.select[key](meta))
			d[key] = test.fromPath[key](meta)
		})
		return d	
	})
	console.log(testData.length, "items > ", `./src/v2i16/json/${test.name}.json`)
	console.log(uniqBy(testData.map(d => d.device)))
	fs.writeFileSync(`./src/v2i16/json/${test.name}.json`, JSON.stringify(testData, null, " "))
})

