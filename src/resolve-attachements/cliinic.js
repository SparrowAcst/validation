const uuid = require("uuid").v4
const { find } = require("lodash")

let data = require("./clinic-users.json")
let orgs = require("./clinic-orgs-processed.json")


data.forEach( d => {
	d.id = uuid()
	if( d.submit && d.submit.clinic) d.clinic = find(orgs, o => o.alias = d.submit.clinic).id
})

console.log(JSON.stringify(data, null, " "))
