const { extend, sortBy, find, truncate, groupBy, keys, isString, last, uniqBy } = require("lodash")
const path = require("path")
const fs = require("fs")

let pattern = process.argv[2] || ""

if(pattern){
	pattern = new RegExp(`${pattern}`)
}

console.log(pattern)

const tests = require("./datasets")
				.filter(t => t.fromMeta || t.fromSpectra)
				.filter( t => pattern.test(t.name))

const metadata = require("./json/v3i16-datasets-report.json")






tests.forEach( test => {
	
	let regex = new RegExp(`/${test.name}/`)
	const data = require(test.spectra)

	console.log(test.name, path.resolve(test.spectra), `: ${data.length} items`)
	
	let testData = data //.filter( d => regex.test(d.metadata.file))
	testData = testData.map( d => {
		// let meta = find(metadata, m => (m.file_id+".wav") == path.basename(d.metadata.file))
		// if(meta){
		// 	keys(test.fromMeta).forEach( key => {
		// 		d[key] = test.fromMeta[key](meta)
		// 	})
		// 	return d 
		// }
		meta = d.metadata //.file.split("/")
		keys(test.fromSpectra).forEach( key => {
			d[key] = test.fromSpectra[key](meta)
		})
		return d	
	})
	console.log(testData.length, "items > ", `./src/v3i16/json/${test.analyzer || test.name}.json`)
	console.log(uniqBy(testData.map(d => d.device)))
	fs.writeFileSync(`./src/v3i16/json/${test.analyzer || test.name}.json`, JSON.stringify(testData, null, " "))

})

