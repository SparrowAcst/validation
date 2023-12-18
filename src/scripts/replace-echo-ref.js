const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find, truncate } = require("lodash")

const prepareFiles = async path => {
	
	const googleDrive = await googledriveService.create(path)
	
	let filelist = googleDrive.fileList()
	
	filelist  = filelist
		.map( f => {
			if(/\"/.test(f.name)){

				f.patientId = f.name.split('"')[1]
				let prefix = f.patientId.substr(0,3)
				let suffix = Number.parseInt(f.patientId.substr(3).split(".")[0])
				f.patientId = `${prefix}${suffix.toString().padStart(4,"0")}`
			} else {
				console.log("!!!",f.name)
			} 
			return f
		})
		.filter( f => f.patientId)

	return filelist	 

}


const run = async () => {

	const filelist = await prepareFiles("ADE BACKUP/Heart Harvest 2 Recovery/Denis/ECHO")

	let forms = require("../../data/collection/Denis/form2-OCH.json")
				.concat(require("../../data/collection/Denis/form2-IBO.json"))
				.concat(require("../../data/collection/Denis/form2-VON.json"))
				
	// let forms = require("./form2-IBO.json")
	// let forms = require("./form2-VON.json")
	console.log(filelist.length)

	forms = sortBy(forms, f => f.patientId)
	let count1 = 0
	let count2 = 0
	forms = forms.map( (f, index) => {
		let file = find(filelist, file => file.patientId == f.patientId)
		if(file){
			count1++
			file.used = true
			console.log(`${index+1}\t${f.patientId}\t${truncate(file.webViewLink)}`)
		} else {
			count2++
			console.log(`${index+1}\t${f.patientId}`)
		}
	})

	console.log(count1,"\t" ,count2, "\n")
	console.log(sortBy(filelist.filter( f => !f.used).map( f => f.name)).join("\n"))

}

run()

