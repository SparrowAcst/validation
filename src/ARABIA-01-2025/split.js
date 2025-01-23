
const { keys, sortBy, groupBy } = require("lodash")
const path = require("path")
const fs = require("fs")

let data = require("./to_label_2024-10-28_sysdiaother.json")


data = data.filter( d => !d.prod)

data = groupBy( data, d => d.dataset)

keys(data).forEach(key => {
	data[key] = data[key].map(d => d.id)
})

// data = data.filter(d => d.prod == "prod_us").map( d => ({
// 	prod: d.prod,
// 	id: d.id
// }))

console.log(JSON.stringify(data, null, " "))

