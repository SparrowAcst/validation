const {sortBy} = require("lodash")

let data = require("./H2-UNRESOLVED-ECHO.json")


// const ROOT = "ADE BACKUP/Heart Harvest 2/Ready for Review"
const ROOT = "ADE BACKUP/Heart Harvest 2 PART 1/Ready for Review"




const folder = {
	"YAL": "STRAZHESKO",
	"SMA": "STRAZHESKO",
	"OLS": "STRAZHESKO",

	"POT": "POTASHEV",
	
	"OCH": "Denis",
	"VON": "Denis",
	"IBO": "Denis",
	
	"PYB":"POLTAVA",
}


const getPath = patientId => {
	let prefix = patientId.substring(0,3)
	let patientFolder = folder[prefix]
	if(!patientFolder) return
	return `${ROOT}/${patientFolder}/${patientId}/${(prefix == "POT") ? "EchoCG" : "ECHO"}/*.*`	
}



const run = async () => {
	
	data = sortBy(data, d => d.patientId)

	const googleDrive = await require("../utils/drive4")()
    const drive = await googleDrive.create({subject: "andrii.boldak@sparrowacoustics.com"})
    await drive.load(ROOT)
    // console.log(drive.fileList())        

	for(let d of data){
		
		f = drive.fileList(getPath(d.patientId))[0]
		// console.log(f)
		d.path = getPath(d.patientId)
		d.link = (f) ? f.webViewLink : undefined
		// console.log(d.patientId, ">", d.patientId.substring(0,3), ">", getPath(d.patientId))
		// console.log(drive.fileList(getPath(d.patientId)))
	}

	console.log(JSON.stringify(data, null, " "))

}

run()

