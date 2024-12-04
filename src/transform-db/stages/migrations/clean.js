module.exports = (schema, out) => [{
        source: `${schema}.labels`,
        dest: `${out}.labels`,
        pipeline: [{
            $project: {
                _id: 0,
                id: 1,
                "Age (Years)": 1,
                "Sex at Birth": 1,
                Ethnicity: 1,
                model: 1,
                "Body Position": 1,
                "Body Spot": 1,
                "Type of artifacts , Artifact": 1,
                "Systolic murmurs": 1,
                "Diastolic murmurs": 1,
                "Other murmurs": 1,
                "Pathological findings": 1,
                state: 1,
                CMO: 1,
                TODO: 1,
                "updated at": {
                    $dateFromString: {
                        dateString: "$updated at",
                    },
                },
                "updated by": 1,
                "Stage Comment": 1,
                "1st expert": 1,
                "2nd expert": 1,
                nextTodo: 1,
                complete: 1,
                Confidence: 1,
                "Bowel sound is present": 1,
                S3: 1,
                S4: 1,
                FINALIZED: 1,
                "Arrhythmia at the moment of recording": 1,
                segmentation: 1,
                aiSegmentation: 1,
                deviceDescription: 1,
                "Rhythm and Arrhythmias": 1,
                "Heart Sound Informativeness": 1,
                "Lung Sound Informativeness": 1,
            },
        }, ]
    },
    {
        source: `${schema}.examinations`,
        dest: `${out}.examinations`,
        pipeline: [{
            $project: {
                _id: 0,
                id: "$uuid",
                userId: 1,
                siteId: 1,
                createdAt: {
                    $dateFromString: {
                        dateString: "$dateTime",
                    },
                },
                synchronizedAt: {
                    $dateFromString: {
                        dateString: "$synchronizedAt",
                    },
                },
                comment: 1,
                state: 1,
                "Stage Comment": 1,
                updatedAt: {
                    $dateFromString: {
                        dateString: "$updated at",
                    },
                },
                updatedBy: "$updated by",
                workflowTags: 1,
                forms: 1,
            },
        }, ]
    },


]