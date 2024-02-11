const { loadXLSX, saveXLSX } = require("./utils/xlsx")
const { extend, groupBy, keys, find } = require("lodash")
const { mkdir, writeFile } = require("./utils/file-system")
const path = require("path")




const file = "./data/structures/data-structures-2024.xlsx"
const sheets = [
	"ai-import",
	"pt-import",
	"rrt-import"
]

const getData = async sheet => {
	let res = await loadXLSX(file, sheet)
	res = groupBy(res, d => d.folder)
	res = keys(res).map( key => {
		return {
			stVersion: res[key][0].stVersion,
			record_folder_id: find(res[key], d => d.type == "record_folder_id").id,
			examination_folder_id: find(res[key], d => d.type == "examination_folder_id").id,
			folder: res[key][0].folder,
			template: res[key][0].template
		}
	})

	return res

}


const run = async () => {

	let res = []
	for( const sheet of sheets ){
		res = res.concat((await getData(sheet)))
	}

	let v2 = res.filter( d => d.stVersion == 2)
	let v3 = res.filter( d => d.stVersion == 3)

	writeFile("./data/structures/import-v2.json", JSON.stringify(v2, null, " "))
	writeFile("./data/structures/import-v3.json", JSON.stringify(v3, null, " "))

}



run()

