// Table header
//  tester	patient	spot	Insufficient quality, the file was not assessed 	The murmur is absent 	murmur	confMurmur

const googledriveService = require("../utils/google-drive")
const { loadXLSX, saveXLSX } = require("../utils/xlsx")
const { writeFile } = require("../utils/file-system")
const { find, keys, sortBy, extend, groupBy, isUndefined, last } = require("lodash")
const { loadJSON, unlink } = require("../utils/file-system")
const { avg, std, mode, anomals, sum, evaluateMeasure } = require("../utils/stat")
const R = require('../utils/R')

// const EXPERT_INPUT_XLSX = "./data/structures/V3-AI-Validation-2024/10.1.1 Test 1.1. Assessment of accuracy of heart murmur detection by Stethophone in clinical environment/Box 9.3.5.1-1.xlsx"

const ST_JSON_DR = "./data/v3/ai/v3pxdr.json"
const ST_JSON_SELF = "./data/v3/ai/v3pxself.json"

const RES_XLSX = "./data/structures/V3-AI-Validation-2024/10.1.1 Test 1.1. Assessment of accuracy of heart murmur detection by Stethophone in clinical environment/stetophone-murmur-detection-new-exp.xlsx"

const EXP_DR_XLSX = "./data/structures/V3-AI-Validation-2024/10.1.1 Test 1.1. Assessment of accuracy of heart murmur detection by Stethophone in clinical environment/murmur-assessments-conf.xlsx"

const EXP_SELF_XLSX = "./data/structures/V3-AI-Validation-2024/10.7 Test 7. Validation of informativeness of Stethophone’s heart sound analysis algorithm for recordings made by lay users/murmur-lay-conf.xlsx"

const assessment = "murmur_6"



const run = async () => {

// let data = await loadXLSX(RES_XLSX, "ef")

// console.log( evaluateMeasure(data.map(d => d.ef))) 	

// return


let dr_data = loadJSON(ST_JSON_DR)

	dr_data = dr_data.map( d => {
		d.patient = last(d.patient_id.split("-"))
		return d 
	})

	dr_data = groupBy(dr_data, d => d.patient)

	dr_data = keys(dr_data).map( key => {
		let d = dr_data[key]
		return {
			patient: d[0].patient,
			drmr: (d.filter( r => r.has_murmur).length > 0) ? "present" : "absent",
			drmrcount: d.filter( r => r.has_murmur).length,
			drmrspots: d.filter( r => r.has_murmur).map( r=> r.record_spot).join(", ")
		}
	})

	dr_data = sortBy(dr_data, d => d.patient)

	// console.log(dr_data)


let self_data = loadJSON(ST_JSON_SELF)

	self_data = self_data.map( d => {
		d.patient = last(d.patient_id.split("-"))
		return d 
	})

	self_data = groupBy(self_data, d => d.patient)

	self_data = keys(self_data).map( key => {
		let d = self_data[key]
		return {
			patient: d[0].patient,
			selfmr: (d.filter( r => r.has_murmur).length > 0) ? "present" : "absent",
			selfmrcount: d.filter( r => r.has_murmur).length,
			selfmrspots: d.filter( r => r.has_murmur).map( r=> r.record_spot).join(", ")
		}
	})

	self_data = sortBy(self_data, d => d.patient)


	let expDr = await loadXLSX(EXP_DR_XLSX, "data")

	expDr = expDr.map( d => {
		return {
			patient: last((d.patient).split("-")),
			spot: d.spot,
			expdrmr: d[assessment]
		}
	})

	expDr = groupBy(expDr, d => d.patient)

	expDr = keys(expDr).map( key => {
		return {
			patient: key,
			expdrmr: (expDr[key].map( d => d.expdrmr).filter( d => d == "present").length > 0) ? "present" : "absent",
			expdrmrcount: expDr[key].map( d => d.expdrmr).filter( d => d == "present").length
		}
	})	


	let expself = await loadXLSX(EXP_SELF_XLSX, "data")

	expself = expself.map( d => {
		return {
			patient: last((d.patient).split("-")),
			spot: d.spot,
			expselfmr: d[assessment]
		}
	})

	expself = groupBy(expself, d => d.patient)

	expself = keys(expself).map( key => {
		return {
			patient: key,
			expselfmr: (expself[key].map( d => d.expselfmr).filter( d => d == "present").length > 0) ? "present" : "absent",
			expselfmrcount: expself[key].map( d => d.expselfmr).filter( d => d == "present").length
		}
	})		

	
	let res = dr_data.map( d => {
		let f = find(self_data, s => s.patient == d.patient)
		let f1 = find(expDr, s => s.patient == d.patient)
		let f2 = find(expself, s => s.patient == d.patient)
		
		return extend({}, d, f, f1, f2)
	}) 

	let header = [
		"patient",
		"drmr",
		"drmrcount",
		"drmrspots",
		"selfmr",
		"selfmrcount",
		"selfmrspots",
		"expdrmr",
		"expdrmrcount",
		"expselfmr",
		"expselfmrcount"
	]

	await saveXLSX(res, RES_XLSX, "data", header)


}

run()

