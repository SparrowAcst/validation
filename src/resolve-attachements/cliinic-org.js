const uuid = require("uuid").v4

let data = require("./clinic-orgs.json")


data.forEach( d => {
	d.id = uuid()
})

console.log(JSON.stringify(data, null, " "))
