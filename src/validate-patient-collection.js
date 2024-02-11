
const { find } = require("lodash")

let patients = require("../data/collection/2-patients.json")
let recovery = require("../data/collection/RECOVERY-PATIENTS.json")

console.log(patients.length, recovery.length)

patients.forEach( p => {
	let f = find( recovery, r => r.patientId == p.patientId)
	if(!f){
		console.log(p)
	} else {
		if(p.docs.length != f.docs.length){
			console.log( p.patientId, p.docs.length, f.docs.length)
		}
	}

})