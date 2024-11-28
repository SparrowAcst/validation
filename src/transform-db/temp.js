const uuid = require("uuid").v4

const clinic = "4f7bfaf7-b5fa-4ed3-89dc-074c054f9f6e"

const data = require("../../../validation-data/ENCODE RECORDS/actor.json")

let res = data.map(d => ({
	id: uuid(),
	clinic,
	name: `${d.firstName} ${d.lastName}`,
	email: [d.email],
	patientPrefix: (d.patientIdPrefix) ? [d.patientIdPrefix] : []
}))

console.log(JSON.stringify(res, null, " "))
