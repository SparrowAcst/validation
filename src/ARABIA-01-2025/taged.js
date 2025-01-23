
const { keys, sortBy, groupBy, last } = require("lodash")
const path = require("path")
const fs = require("fs")
const uuid = require("uuid").v4
const getRecord = data => ({
 
  "id": data.id,
  "Segmentation URL": `http://ec2-54-235-192-121.compute-1.amazonaws.com:8002/?record_v3=prod_20243110/${data.id}.wav&patientId=${last(data.userId.split("-"))}&position=${data.bodyPosition}&spot=${data.spot}&device=Stethophone`,
  "Examination ID": last(data.userId.split("-")),
  "examination_created_at": new Date(),
  "examination_id": data.userId,
  "Clinic": "PRODUCTION DATA",
  "model": "Stethophone",
  "deviceDescription": "unknown",
  "Body Position": data.bodyPosition,
  "Body Spot": data.spot,
  "Type of artifacts , Artifact": [],
  "Systolic murmurs": [],
  "Diastolic murmurs": [],
  "Other murmurs": [],
  "Pathological findings": [],
  "path": `prod_20243110/${data.id}.wav`,
  "state": "",
  "CMO": "",
  "TODO": "",
  "Stage Comment": "",
  "tags": [
    {
      "tag": `SOURCE: ${(data.prod == "prod_us" ) ? "production(US)" : "production(UA)"}`,
      "createdAt": {
        "$date": new Date()
      },
      "createdBy": {
        "namedAs": "import utils",
        "email": "",
        "photo": ""
      }
    },
    {
      "tag": "TASK: NOV2024 Murmurs",
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
  "importNote": "Check for systolic & diastolic combined or other murmur.",
  
})


let data = require("./to_label_2024-10-31-US+UA-metadata.json")

// console.log(data.length)
data = data
.map( d => {
	d.id = d.id || uuid()
	d.userId = d.userId || uuid() 
	d.bodyPosition = d.bodyPosition || "unknown"
	d.spot = d.spot || "unknown"
	return d
})
.map( (d, i) => {
	// console.log(i+1, d)
	return getRecord(d)
})

// console.log(data.length)
console.log(JSON.stringify(data, null, " "))

