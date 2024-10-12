// Table header
//  tester	patient	spot	Insufficient quality, the file was not assessed 	The murmur is absent 	murmur	confMurmur

const googledriveService = require("../utils/google-drive")
const { loadXLSX, saveXLSX } = require("../utils/xlsx")
const { writeFile } = require("../utils/file-system")
const { find, keys, sortBy, extend, groupBy, isUndefined, uniqBy, first, last } = require("lodash")
const { loadJSON, unlink } = require("../utils/file-system")
const { avg, std, mode, anomals, sum } = require("../utils/stat")
const R = require('../utils/R')

const INPUT_XLSX = "./data/structures/V3-AI-Validation-2024/10.2.1 Test 2.1. Validation of heart sounds timing by Stethophone in clinical environment/segments-ecg-processed.xlsx"
const POOL_XLSX = "./data/structures/V3-AI-Validation-2024/10.2.1 Test 2.1. Validation of heart sounds timing by Stethophone in clinical environment/segments-pool.xlsx"
const DUR_XLSX = "./data/structures/V3-AI-Validation-2024/10.2.1 Test 2.1. Validation of heart sounds timing by Stethophone in clinical environment/segments-duration.xlsx"



const range = (start, end, step = 1) => {
  if(!end){
      end = start + 1
  } else {
      end++
  }
  
  return Array.from(
        { length: Math.ceil((end - start) / step) },
        (_, i) => i * step + start
     )
}     

const text2array = text => {
    let ranges = text.toString().split(",").map( d=> d.trim()).map(d => d.split("-").map(d => Number.parseInt(d.trim())))
    let res = []
    ranges.forEach( r => {
        res.push(range(...r))
    })
    return res
}



const run = async () => {

	let	data = await loadXLSX(INPUT_XLSX, "data")


	console.log(uniqBy(data.map(d => d.spot)))
	console.log(uniqBy(data.map(d => d.patient)))
	
	console.log(keys(data[0]))

	let spots_ = groupBy(data, d => d.spot)

	
	data = groupBy(data, d => d.patient)
	keys(data).forEach( key => {
		data[key] = sortBy(data[key], d => d.st_fit)
	})

	let pool = await loadXLSX(POOL_XLSX, "data")
	pool = groupBy(pool.filter(d => d.device == "Stethophone"), d => d.patientId)
	keys(pool).forEach( key => {
		pool[key] = sortBy(pool[key], d => d.start)
	})

	// console.log(pool)

	const getSourceSegment = (id, seg) => {
		let f = find(pool[id], v => Math.abs(v.start -seg.st_start) < 0.000001)
		if(f){
			return f
		} else {
			console.log("NOT FOUND")
		}
	}


	let options = await loadXLSX(INPUT_XLSX, "options")
	let dur = []
	options.forEach( d => {
		
		let skips = []
		
		let lastSeg = last(data[d.patient])
		let s1 = getSourceSegment(d.patient, first(data[d.patient]))
		let s2 = getSourceSegment(d.patient, last(data[d.patient]))
		let total = s2.end- s1.start		
		


		if(!isUndefined(d.st_skip)){
			console.log(d.patient)
			skips = text2array(d.st_skip).map(a => {
				let startIndex = first(a)
				let stopIndex = last(a)
				let start = pool[d.patient][startIndex].start
				let end = pool[d.patient][stopIndex].end
				let duration = end - start
				

				return {
					recordId: d.patient,
					// spot: d.spot,
					total,
					totalSegments: data[d.patient].length,
					duration,
					startIndex,
					stopIndex,
					start,
					end,
					types: a.map( v => pool[d.patient][v].type)//.join(", ")
				}
			})
		
		} else {
			skips = [{
					recordId: d.patient,
					// spot: d.spot,
					total,
					totalSegments: data[d.patient].length
			}]
		}
		dur = dur.concat(skips)
	
	})

	dur = groupBy(sortBy(dur, d => d.recordId), d => d.recordId)

	dur = keys(dur).map( key => {
		let record = dur[key]
		return {
			recordId: record[0].recordId,
			// spot: record[0].spot,
			totalDuration: record[0].total,
			totalSegments: record[0].totalSegments, 
			excludedDuration: record
				.filter( d => d.types && d.types.includes("unsegmentable"))
				.map(d => d.duration)
				.reduce( (a,b) => a+b, 0),
			excludedSegments: record
				.filter( d => d.types && d.types.includes("unsegmentable"))
				.map(d => d.types.length)
				.reduce( (a,b) => a+b, 0),
				
		}
	})


	dur = dur.map( d => {
		d.spot = data[d.recordId][0].spot //d.recordId.split("-")[0]
		return d
	})

	dur = groupBy(dur, d => d.spot)
	
	dur = keys(dur).map( key => {
		let record = dur[key]

		return {
			spot: key,
			records: record.length,
			totalDuration: sum(record.map(d => d.totalDuration)),
			totalSegments: sum(record.map(d => d.totalSegments)),
			excludedDuration: sum(record.map(d => d.excludedDuration)),
			excludedSegments: sum(record.map(d => d.excludedSegments))
					
		}
	})	


	keys(spots_).forEach( key => {
		console.log(key, uniqBy(spots_[key], d => d.patient).length)
	})

	await saveXLSX(sortBy(dur, d => d.spot), DUR_XLSX, "data")


	// let header = [
	// 	"patient",
	// 	"spot",
	// 	"qtyAI",
	// 	"murmur_1",
	// 	"confMurmur_1",
	// 	"murmur_2",
	// 	"confMurmur_2",
	// 	"murmur_3",
	// 	"confMurmur_3",
	// 	"murmur_4",
	// 	"confMurmur_4",
	// 	"murmur_5",
	// 	"confMurmur_5",
	// 	"murmur_6",
	// 	"confMurmur_6",
	// 	"murmurInclusion",
	// 	"murmurAssessment",
	// 	"murmurAI"
	// ]



	// await saveXLSX(data, RES_XLSX, "data")


}

run()

