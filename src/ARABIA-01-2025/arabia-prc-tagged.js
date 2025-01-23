const { keys, sortBy, groupBy, last, find } = require("lodash")
const path = require("path")
const fs = require("fs")
const uuid = require("uuid").v4

const patientPrefix = "ARB"

const saveJSON = ({file, data}) => {
    fs.writeFileSync(file, JSON.stringify(data, null, " "))
}

const collection = {
    organizations: require("./ARABIA DATASET/sparrow.arabia.organizations.json"),  
    actors: require("./ARABIA DATASET/sparrow.arabia.actors.json")
}

const organizationId = collection.organizations[0].id
const actorId = collection.actors.id

let data = require("./EXPORT-ARABIA-TAGGED.json")

const extractTopic = name => {
    return name.split("_")[0]
    // let parts = name.split("_")
    // if (parts[1] == "Normal") {
    //     return "Normal"
    // } else {
    //     return `${parts[1]}_${parts[2]}`
    // }
}

const getDiagnosis = topic => {
    const d = {
        "N": ["81248a54-dfcf-40de-bc1c-aa6b5703076f"],
        "AR": ["e2d56967-ca13-4a52-8721-ada8d09ba2b2"],
        "AS": ["88c249de-aa43-498d-af54-dda3bb50b80a"],
        "MR": ["d7d071e1-9704-4e04-88b0-6bea9a054685", "9b7503c5-8605-4e29-88ac-a86145d3fb72"],
        "MS": ["1573cfb1-a48a-4ba0-b36c-10f3f8831ade"],
        "PR": ["01f8a330-9d8b-412b-81af-dfa1f919c973"],
        "PS": ["1aeb17f7-6c8b-4314-81b8-a40dc015d386"],
        "TR": ["05ecf70c-ee3b-48a7-a62d-6563de1e58de"],
        "TS": ["bf0d27c4-f76a-497e-a71b-00b63dc518b3"]
    }


    let res = ["fcaed40a-cf3a-409f-aa20-32c8e942a311"] // 1. General Diagnoses/Incomplete diagnosis
    res = res.concat(d[topic] || [])

    return res.filter(d => d)

}

const getExamination = patientId => {
    const examinatonId = uuid()
    return {
        "id": examinatonId,
        "dateTime": new Date(),
        "patientId": patientId,
        "organization": organizationId,
        "comment": null,
        "state": "accepted",
        "type": null,
        "userId": actorId,
        "org": "KAU",
        "synchronizedAt": new Date(),
        "actorId": actorId,
        "updatedAt": new Date(),
        "workflowTags": [],
        "updated at": new Date(),
        "Stage Comment": "",
        "updated by": "import utils",
        "siteId": organizationId,
        "uuid": examinatonId
    }
}

const getForms = d => {

    const examination = find(examinations, e => e.patientId == d.patientId) || {}

    return [{
            "id": uuid(),
            "type": "attachements",
            "examinationId": d.examinationId,
            "data": [],
            "process_atch": true,
            "resolvedData": [],
            "patientId": d.patientId
        },
        {
            "id": uuid(),
            "submittedBy": d.actorId,
            "type": "patient",
            "data": {
                "updatedBy": "",
                "uk": {},
                "en": {
                    "reliability": [{
                        "createdBy": {
                            "name": "import utils",
                        },
                        "createdAt": new Date(),
                        "reliability": "The results are absent",
                        "finalized": true
                    }],

                    "diagnosis": [{
                        "tags": d.diagnosis,
                        "createdBy": {
                            "name": "import utils"
                        },    
                        "createdAt": new Date(),
                        "finalized": true
                    }],
                    
                    "diagnosisTags": {
                        "tags": d.diagnosis,
                        "createdBy": {
                            "name": "import utils"
                        },
                        "createdAt": new Date(),
                        "finalized": true
                    },
                    "diagnosisReliability": [{
                        "createdBy": {
                            "name": "import utils"
                        },
                        "createdAt": new Date(),
                        "reliability": 3,
                        "finalized": true
                    }],
                    "finalized": true
                }
            },
            "examinationId": d.examinationId,
            "patientId": d.patientId
        },
        {
            "id": uuid(),
            "submittedBy": d.actorId,
            "type": "ekg",
            "data": {
                "updatedBy": "",
                "uk": {},
                "en": {
                    "formType": "ekg",
                    "id": uuid(),
                    "reliability": [{
                        "createdBy": {
                            "name": "import utils"
                        },
                        "createdAt": new Date(),
                        "reliability": "The results are absent",
                        "finalized": true
                    }],
                    "finalized": true
                }
            },
            "examinationId": d.examinationId,
            "patientId": d.patientId
        },
        {
            "id": uuid(),
            "submittedBy": d.actorId,
            "type": "echo",
            "data": {
                "updatedBy": "",
                "uk": {},
                "en": {
                    "formType": "echo",
                    "reliability": [{
                        "createdBy": {
                            "name": "import utils"
                        },
                        "createdAt": new Date(),
                        "reliability": "The results are absent",
                        "finalized": true
                    }],
                    "finalized": true
                }
            },
            "examinationId": d.examinationId,
            "patientId": d.patientId
        }
    ]
}



let examinations = []
let forms = []


data.forEach( (d, index) => {
  let patientId = `${patientPrefix}${String(index+1353).padStart(4,"0")}`
  let examination = getExamination(patientId)
  let examinationId = examination.id

  examinations.push(examination)
  
  forms = forms.concat(getForms({
    patientId,
    examinationId,
    actorId,
    diagnosis: getDiagnosis(extractTopic(d.id))
  }))

  d.id = uuid()
  d["Examination ID"] = patientId
  d.Clinic = "KAU"
  d.CMO = "Yaroslav Shpak"
  d["1st expert"] = "Yaroslav Shpak"
  d["2nd expert"] = "Yaroslav Shpak"
  d.FINALIZED = true
  d.TODO = "Finalized"
  d.part = 1

})


saveJSON({
  file: "./src/import-selection/ARABIA DATASET/sparrow.examinations-part1.json",
  data: examinations
})

saveJSON({
  file: "./src/import-selection/ARABIA DATASET/sparrow.forms-part1.json",
  data: forms
})

saveJSON({
  file: "./src/import-selection/ARABIA DATASET/sparrow.labels-part1.json",
  data: data
})
