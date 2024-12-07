module.exports = (schema, out) => [{
        source: `${schema}.labels`,
        dest: `${out}.labels`,
        pipeline: [{
                $project: {
                    _id: 0,
                    "Segmentation URL": 0,
                    Source: 0,
                    Clinic: 0,
                    path: 0,
                    supd: 0,
                    UPDATE_FB_SEG: 0,
                    migrated: 0,
                    process_ai: 0,
                    PUBLIC_URL_UPDATED: 0,
                    Healthy: 0,
                    "Clinical Metadata Reviewed": 0,
                    "Intestinal Sounds Review Completed": 0,
                    "Final Lung Sound Review Completed": 0,
                    "Final Heart Sound Review Completed": 0,
                    "Final Vascular Sound Review Completed": 0,
                    "Lung Pathologycal Sound": 0,
                    SOUND_FILE_EXISTS: 0,
                    "Sound Presentation": 0,
                    "Sound Segmentation": 0,
                    "S1 Description": 0,
                    "S1 Mitral component Loudness": 0,
                    "S1 Split Type": 0,
                    "Stethoscope Model": 0,
                    "Arterial murmur": 0,
                    "Patient Count": 0,
                    "S2 description": 0,
                    "S2 Split Type": 0,
                    "Recorded with Fiter": 0,
                    _import: 0,
                    "Class of the informativeness": 0,
                    supd1: 0,
                },
            },
            {
                $lookup: {
                    from: "examinations",
                    localField: "Examination ID",
                    foreignField: "patientId",
                    as: "examinationId",
                    pipeline: [{
                        $project: {
                            _id: 0,
                            uuid: 1,
                        },
                    }, ],
                },
            },
            {
                $set: {
                    examinationId: {
                        $first: "$examinationId",
                    },
                },
            },
            {
                $set: {
                    examinationId: "$examinationId.uuid",
                    taskList: [],
                    "updated at": {
                      $dateFromString:{
                        dateString: "$updated at"
                      }
                    }
                },
            },
        ]
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