// Table header
//  tester	patient	spot	Insufficient quality, the file was not assessed 	The murmur is absent 	murmur	confMurmur

const googledriveService = require("../utils/google-drive")
const { loadXLSX, saveXLSX } = require("../utils/xlsx")
const { writeFile } = require("../utils/file-system")
const { find, keys, sortBy, extend, groupBy, isUndefined, uniqBy, first, last } = require("lodash")
const { loadJSON, unlink } = require("../utils/file-system")
const { avg, std, mode, anomals, sum } = require("../utils/stat")
const R = require('../utils/R')

const INPUT_XLSX = "./data/structures/V3-AI-Validation-2024/10.6  Test 6. Validation of repeatability of heart sounds timing algorithm/segments-processed.xlsx"
const POOL_XLSX = "./data/structures/V3-AI-Validation-2024/10.6  Test 6. Validation of repeatability of heart sounds timing algorithm/segments-pool.xlsx"

const RES_XLSX = "./data/structures/V3-AI-Validation-2024/10.6  Test 6. Validation of repeatability of heart sounds timing algorithm/segments-completed.xlsx"
const DUR_XLSX = "./data/structures/V3-AI-Validation-2024/10.6  Test 6. Validation of repeatability of heart sounds timing algorithm/segments-duration.xlsx"



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

	let	data = await loadXLSX(INPUT_XLSX, "sync-1")

	data = data.map( d => {
		d.spot = d.patient.split("-")[0]
		return d
	})


	console.log(uniqBy(data.map(d => d.spot)))
	console.log(keys(data[0]))

	data = groupBy(data, d => d.patient)
	keys(data).forEach( key => {
		data[key] = sortBy(data[key], d => d.ST_fit)
	})

	let pool = await loadXLSX(POOL_XLSX, "data")
	pool = groupBy(pool.filter(d => d.device == "Stethophone"), d => d.patientId)
	keys(pool).forEach( key => {
		pool[key] = sortBy(pool[key], d => d.start)
	})

	
	const getSourceSegment = (id, seg) => {
		let f = find(pool[id], v => Math.abs(v.start -seg.st_start) < 0.000001)
		if(f){
			return f
		} else {
			console.log("NOT FOUND", d["record id"], lastSeg, pool[d["record id"]])
		}
	}


	let options = await loadXLSX(INPUT_XLSX, "options-1")
	let dur = []
	options.forEach( d => {
		
		let skips = []
		
		
		let lastSeg = last(data[d["record id"]])
		let s1 = getSourceSegment(d["record id"], first(data[d["record id"]]))
		let s2 = getSourceSegment(d["record id"], last(data[d["record id"]]))
		let total = s2.end- s1.start		
		


		if(!isUndefined(d.ST_shift)){
			skips = text2array(d.ST_shift).map(a => {
				let startIndex = first(a)
				let stopIndex = last(a)
				let start = pool[d["record id"]][startIndex].start
				let end = pool[d["record id"]][stopIndex].end
				let duration = end - start
				

				return {
					recordId: d["record id"],
					total,
					totalSegments: data[d["record id"]].length,
					duration,
					startIndex,
					stopIndex,
					start,
					end,
					types: a.map( v => pool[d["record id"]][v].type)//.join(", ")
				}
			})
		
		} else {
			skips = [{
					recordId: d["record id"],
					total,
					totalSegments: data[d["record id"]].length
			}]
		}
		dur = dur.concat(skips)
	
	})

	dur = groupBy(sortBy(dur, d => d.recordId), d => d.recordId)

	dur = keys(dur).map( key => {
		let record = dur[key]
		return {
			recordId: record[0].recordId,
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
		d.spot = d.recordId.split("-")[0]
		return d
	})

	dur = groupBy(dur, d => d.spot)
	
	dur = keys(dur).map( key => {
		let record = dur[key]

		return {
			spot: key,
			totalDuration: sum(record.map(d => d.totalDuration)),
			totalSegments: sum(record.map(d => d.totalSegments)),
			excludedDuration: sum(record.map(d => d.excludedDuration)),
			excludedSegments: sum(record.map(d => d.excludedSegments))
					
		}
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

