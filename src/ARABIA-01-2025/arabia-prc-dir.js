const { keys, sortBy, groupBy, last, find } = require("lodash")
const path = require("path")
const fs = require("fs")
const uuid = require("uuid").v4


const saveJSON = ({file, data}) => {
    fs.writeFileSync(file, JSON.stringify(data, null, " "))
}



let data = require("./arabia-2-dir.json")

const extractTopic = name => {
    let parts = name.split("_")
    if (parts[1] == "Normal") {
        return "Normal"
    } else {
        return `${parts[1]}_${parts[2]}`
    }
}

const getDiagnosis = topic => {
    const d = {
        "Normal": ["81248a54-dfcf-40de-bc1c-aa6b5703076f"],
        "Aortic_regurgitation": ["e2d56967-ca13-4a52-8721-ada8d09ba2b2"],
        "Aortic_stenosis": ["88c249de-aa43-498d-af54-dda3bb50b80a"],
        "Mitral_regurgitation": ["d7d071e1-9704-4e04-88b0-6bea9a054685", "9b7503c5-8605-4e29-88ac-a86145d3fb72"],
        "Mitral_stenosis": ["1573cfb1-a48a-4ba0-b36c-10f3f8831ade"],
        "Pulmonary_regurgitation": ["01f8a330-9d8b-412b-81af-dfa1f919c973"],
        "Pulmonic_stenosis": ["1aeb17f7-6c8b-4314-81b8-a40dc015d386"],
        "Tricuspid_regurgitation": ["05ecf70c-ee3b-48a7-a62d-6563de1e58de"],
        "Tricuspid_stenosis": ["bf0d27c4-f76a-497e-a71b-00b63dc518b3"]
    }


    let res = ["fcaed40a-cf3a-409f-aa20-32c8e942a311"] // 1. General Diagnoses/Incomplete diagnosis
    res = res.concat(d[topic] || [])

    return res.filter(d => d)

}

data = data.map(d => {
    return {
        id: uuid(),
        path: `arabia/${d}`,
        topic: extractTopic(d),
        diagnosis: getDiagnosis(extractTopic(d))
    }
})

const organizationId = uuid()
const organizations = [{
    id: organizationId,
    country: "Saudi Arabia",
    name: "King Abdulaziz University"
}]

const actorId = uuid()
const patientPrefix = "ARB"

const actors = [{
    "id": actorId,
    "lastName": "Ahmed Barnawi and Sami Nawar Alrabie",
    "firstName": "",
    "organization": organizationId,
    "languageCode": "en",
    "userId": actorId,
    "email": "ambarnawi@kau.edu.sa",
    "patientIdPrefix": patientPrefix,
    "patientIdCounter": 500
}]

let labels = []
let examinations = []
let forms = []

const getExamination = d => {
    const examinatonId = uuid()
    return {
        "id": examinatonId,
        "dateTime": new Date(),
        "patientId": d.patientId,
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
            "examinationId": examination.id,
            "data": [],
            "process_atch": true,
            "resolvedData": [],
            "patientId": d.patientId
        },
        {
            "id": uuid(),
            "submittedBy": actorId,
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
            "examinationId": examination.id,
            "patientId": d.patientId
        },
        {
            "id": uuid(),
            "submittedBy": actorId,
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
            "examinationId": examination.id,
            "patientId": d.patientId
        },
        {
            "id": uuid(),
            "submittedBy": actorId,
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
            "examinationId": examination.id,
            "patientId": d.patientId
        }
    ]
}


const getLabels = d => {
    
    const examination = find(examinations, e => e.patientId == d.patientId) || {}

    return {
        "id": uuid(),
        "Segmentation URL": `http://ec2-54-235-192-121.compute-1.amazonaws.com:8002/?record_v3=${d.path}&patientId=${d.patientId}&position=unknown&spot=unknown&device=unknown`,
        "path": d.path,
        "Examination ID": d.patientId,
        "Clinic": "KAU",
        "Age (Years)": -1,
        "Sex at Birth": "unknown",
        "Ethnicity": "unknown",
        "model": "unknown",
        "Body Position": "unknown",
        "Body Spot": "unknown",
        "state": "Assign 2nd expert",
        "CMO": "Yaroslav Shpak",
        "TODO": "Assign 2nd expert",
        "updated at": new Date(),
        "updated by": "import utils",
        "Stage Comment": "",
        "nextTodo": "Assign 2nd expert"
    }

}



data.forEach((d, index) => {
    d.patientId = `${patientPrefix}${String(index).padStart(4,"0")}`
    examinations.push(getExamination(d))
    forms = forms.concat(getForms(d)) 
    labels.push(getLabels(d))

})



const collections = [
    {
      file: "./src/import-selection/ARABIA DATASET/sparrow.arabia.labels.json",
      data: labels
    },
    {
      file: "./src/import-selection/ARABIA DATASET/sparrow.arabia.examinations.json",
      data: examinations
    },  
    {
      file: "./src/import-selection/ARABIA DATASET/sparrow.arabia.forms.json",
      data: forms
    },  
    {
      file: "./src/import-selection/ARABIA DATASET/sparrow.arabia.organizations.json",
      data: organizations
    },  
    {
      file: "./src/import-selection/ARABIA DATASET/sparrow.arabia.actors.json",
      data: actors
    },
    {
      file: "./src/import-selection/ARABIA DATASET/sparrow.arabia.segmentations.json",
      data: []
    }  
]

for(const collection of collections){
  saveJSON(collection)
}

