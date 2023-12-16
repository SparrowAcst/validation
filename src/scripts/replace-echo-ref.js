const googledriveService = require("../utils/google-drive")
const { extend, sortBy, find } = require("lodash")

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
			} 
			return f
		})
		.filter( f => f.patientId)

	return filelist	 

}


const run = async () => {

	const filelist = await prepareFiles("ADE BACKUP/Heart Harvest 2 Recovery/Denis/ECHO")

	let forms = require("./form2-OCH.json")
	// let forms = require("./form2-IBO.json")
	// let forms = require("./form2-VON.json")
	

	forms = sortBy(forms, f => f.patientId)
	
	forms = forms.map( (f, index) => {
		let file = find(filelist, file => file.patientId == f.patientId)
		if(file){
			console.log(`${index+1}\t${f.patientId}\t${file.webViewLink}`)
		} else {
			console.log(`${index+1}\t${f.patientId}`)
		}
	})

}

run()

