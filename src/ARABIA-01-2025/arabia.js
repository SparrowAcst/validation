
const { keys, sortBy, groupBy, last } = require("lodash")
const path = require("path")
const fs = require("fs")
const uuid = require("uuid").v4

const getRecord = data => ({
 
  "id": data.id,
  "Segmentation URL": `http://ec2-54-235-192-121.compute-1.amazonaws.com:8002/?record_v3=arabia/${data.id}.wav,&patientId=${last(data.userId.split("-"))}&position=${data.bodyPosition}&spot=${data.spot}&device=Stethophone`,
  "Examination ID": data.id,
  "examination_created_at": new Date(),
  "examination_id": data.userId,
  "Clinic": "ARABIA",
  "model": "unknown",
  "deviceDescription": "unknown",
  "Body Position": data.bodyPosition,
  "Body Spot": data.spot,
  "Type of artifacts , Artifact": [],
  "Systolic murmurs": [],
  "Diastolic murmurs": [],
  "Other murmurs": [],
  "Pathological findings": [],
  "path": `arabia/${data.id}.wav`,
  "state": "",
  "CMO": "",
  "TODO": "",
  "Stage Comment": "",
  "tags": [
    {
      "tag": "TASK: ARABIA 24 FILES",
      "createdAt": {
        "$date": new Date()
      },
      "createdBy": {
        "namedAs": "import utils",
        "email": "",
        "photo": ""
      }
    }
  ],
  "importNote": "",
  "segmentation": data.segmentation
  
})



let data = [
"AR",
"AS",
"MR",
"MR_1",
"MR_2",
"MR_3",
"MR_4",
"MR_5",
"MS",
"MS_2",
"TR",
"TS",
"N_41",
"N_42",
"N_45",
"N_46",
"N_48",
"N_49",
"N_52",
"N_54",
"N_56",
"N_57",
"N_58",
"N_59"
]


// let data = require("./tested-records.json")
// 
// console.log(data.length)
data = data
// .slice(0,5)
.map( d1 => {
	let d = {}
  d.id = d1
	d.userId = d.userId || uuid() 
	d.bodyPosition = d.bodyPosition || "unknown"
	d.spot = d.spot || "unknown"
  d.r = d1
	return d
})
.map( (d, i) => {
	return getRecord(d)
})

// console.log(data.length)
console.log(JSON.stringify(data, null, " "))

