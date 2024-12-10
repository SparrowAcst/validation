
const { find, keys, first, last, extend } = require("lodash")

let encodeData = require("./exam-encode.json").map( d => ({
	patientId: d.patientId,
	collection: `${d.schema}.examinations`
}))

let data = require("./exam-cross.json")

let res = []

const decode = data => find(encodeData, d => d.patientId == data.patientId)

const decodeTrace = array => {
	return array.map(d => extend(d, decode(d)))
}



data = data.map( d => {
	
	if( !d.trace ) {
		return {
			forward:{
				source: d.src,
				target: decode({patientId: d.patientId})
			},
			backward: {
				source: decode({patientId: d.patientId}),
				target: d.src
			}
		}
	} 
	

	let trace = decodeTrace(d.trace)
	let target
	do {
		target = trace.shift()
	} while ( trace.length > 0 && !target.crashed )	

	return {
		forward: {
			source: d.src,
			target: (!target.crashed) ? target : {
				patientId: d.patientId,
				collection: "ADE-TRANSFORM.examinations"
			}
		},
		trace: d.trace
	}	



}).filter(d => d)


console.log(JSON.stringify(data, null, " "))





