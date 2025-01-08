const execute = require("./utils/migrate-mix")

const migrations = require("./migrations/migrate")

const schemas = [

	{
        source: {
            label_collection: "innocent-reallife-labels",
            patientCollection: "innocent-reallife-examinations",
            form_collection: "innocent-reallife-forms"
        },
        target: "innocent-reallife-ua",
        label_pipeline: [{
            $match: {
                "deviceDescription.appStoreRegion": "Ukraine"
            }
        }],

        patient_pipeline: [{
            $match: {
                org: "SPD-UA"
            }
        }]
    },

    {
        source: {
            label_collection: "innocent-reallife-labels",
            patientCollection: "innocent-reallife-examinations",
            form_collection: "innocent-reallife-forms"
        },
        target: "innocent-reallife-us",
        label_pipeline: [{
            $match: {
                "deviceDescription.appStoreRegion": {
                	$ne: "Ukraine"
                }	
            }
        }],

        patient_pipeline: [{
            $match: {
                org: "SPD-US"
            }
        }]
    },

    {
        source: {
            label_collection: "arabia-labels",
            patientCollection: "arabia-examinations",
            form_collection: "arabia-forms"
        },
        target: "arabia"
    },

    {
        source: {
            label_collection: "clinic4",
            patientCollection: "clinic4-exam",
            form_collection: "clinic4-form"
        },
        target: "clinic4"
    },

    {
        source: {
            label_collection: "phisionet",
            patientCollection: "phisionet-exams",
            form_collection: "phisionet-forms",
            segmentationCollection: "phisionet-SEGMENTATION"
        },
        target: "phisionet"
    },

    {
        source: {
            label_collection: "stethophone-app",
            patientCollection: "stethophone-app-exams",
            form_collection: "stethophone-app-forms"
        },
        target: "stethophone-app"
    },

    {
        source: {
            label_collection: "vinil",
            patientCollection: "vinil-exams",
            form_collection: "vinil-forms"
        },
        target: "vinil"
    },

    {
        source: {
            label_collection: "vintage",
            patientCollection: "vintage-exam",
            form_collection: "vintage-form"
        },
        target: "vintage"
    },

    {
        source: {
            label_collection: "H3",
            patientCollection: "H3-EXAMINATION",
            form_collection: "H3-FORM",
            segmentationCollection: "H3-SEGMENTATION",
            label_pipeline: [{
                $match: {
                    Clinic: "Denis"
                }
            }],
            patient_pipeline: [{
                $match: {
                    org: "Denis"
                }
            }]
        },
        target: "denis-part-2"
    },

    {
        source: {
            label_collection: "H3",
            patientCollection: "H3-EXAMINATION",
            form_collection: "H3-FORM",
            segmentationCollection: "H3-SEGMENTATION",
            label_pipeline: [{
                $match: {
                    Clinic: "POLTAVA"
                }
            }],
            patient_pipeline: [{
                $match: {
                    org: "POLTAVA"
                }
            }]
        },
        target: "poltava-part-2"
    },

    {
        source: {
            label_collection: "H3",
            patientCollection: "H3-EXAMINATION",
            form_collection: "H3-FORM",
            segmentationCollection: "H3-SEGMENTATION",
            label_pipeline: [{
                $match: {
                    Clinic: "POTASHEV"
                }
            }],

            patient_pipeline: [{
                $match: {
                    org: "POTASHEV"
                }
            }]

        },
        target: "potashev-part-2"
    },

    {
        source: {
            label_collection: "H3",
            patientCollection: "H3-EXAMINATION",
            form_collection: "H3-FORM",
            segmentationCollection: "H3-SEGMENTATION",
            label_pipeline: [{
                $match: {
                    Clinic: "STRAZHESKO"
                }
            }],

            patient_pipeline: [{
                $match: {
                    org: "STRAZHESKO"
                }
            }]
        },
        target: "strazhesko-part-2"
    },




]


const run = async () => {

    for (const schema of schemas) {

        console.log(schema)
        // console.log(JSON.stringify(migrations(schema), null, " "))	

        await execute(migrations(schema))
    }

}

run()