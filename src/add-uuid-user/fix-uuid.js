const uuid = require("uuid").v4

let data = require("./app-grants.json")

data = data.map(d => {
	d.id = uuid()
	return d
})


console.log(JSON.stringify(data, null, " "))