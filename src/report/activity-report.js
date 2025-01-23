const { uniqBy, flatten, sortBy, find } = require("lodash")

const text = ["", "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

const monthes = [1,2,3,4,5,6,7,8,9,10,11,12].map( d => `${d} 2025`)
	
const n2Month = month => {
	const text = ["", "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
	let parts = month.split(" ")
	return `${text[Number.parseInt(parts[0])]}_${parts[1]}`
}	

const data = require("./ADE-ACTIVITY-REPORT-2025.json")

const users = uniqBy(data.map(d => d.user))
let datasets = sortBy(uniqBy(flatten(data.map( d => d.datasets.map(d => d.dataset)))))
// const monthes = sortBy(uniqBy(data.map(d => d.month)))


const userReport = user => {
	console.log(user.split(" ").join("_"))
	console.log(`No\tDataset\t${monthes.map(d => n2Month(d)).join("\t")}`)
	let i = 0
	for(const dataset of datasets) {
		i++
		let row = `${i}\t${dataset.split(" ").join("_")}\t`
		for(const month of monthes) {
			let f = find(data, d => d.user == user && d.month == month)
			f = f || { datasets: [] }
			let ds = find(f.datasets, d => d.dataset == dataset)
			ds = ds || { activity: []}
			let activity = ds.activity.reduce((a,b) => a+b, 0)
			row += `${(activity) ? activity : " "}\t`
		}
		console.log(row)
	}
	console.log()
	console.log()	
}

for(const user of users){
	userReport(user)	
}


console.log(sortBy(uniqBy(data.map(d => d.month))))