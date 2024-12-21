module.exports = source => ({
    labels: [{
            $addFields: {
                state: "$TODO",

            },
        },
        {
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
                TODO: 0,
                "updated at": 0,
                "updated by": 0,
                src: 0,
                "1st expert": 0,
                "2nd expert": 0,
                CMO: 0,
                "assigned to": 0,
                "Assigned to": 0,
                "Final comments": 0,
                process_records: 0
            },
        },
        {
            $lookup: {
                from: (source) ? source.patientCollection : "examinations",
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
                taskList: []
            },
        },
        {
            $project: {
                _id: 0,
                "Examination ID": 0,
                FINALIZED: 0,
                "updated at": 0,
                nextTodo: 0,
                "1st level comments": 0,
                "2nd level comments": 0,
                "Stage Comment": 0,
                schema: 0
            },
        },
    ],

    examinations: [{
            $lookup: {
                from: (source) ? source.form_collection : "dummy",
                localField: "patientId",
                foreignField: "patientId",
                as: "af",
                pipeline: [{
                    $project: {
                        _id: 0,
                        type: 1,
                        data: "$data.en",
                    },
                }, ],
            },
        },
        {
            $project:{
                forms: 0
            }
        },
        {
            $set: {
                "forms.patient": {
                    $first: {
                        $filter: {
                            input: "$af",
                            as: "item",
                            cond: {
                                $eq: ["$$item.type", "patient"],
                            },
                        },
                    },
                },
                "forms.echo": {
                    $first: {
                        $filter: {
                            input: "$af",
                            as: "item",
                            cond: {
                                $eq: ["$$item.type", "echo"],
                            },
                        },
                    },
                },
                "forms.ekg": {
                    $first: {
                        $filter: {
                            input: "$af",
                            as: "item",
                            cond: {
                                $eq: ["$$item.type", "ekg"],
                            },
                        },
                    },
                },
                "forms.attachements": {
                    $first: {
                        $filter: {
                            input: "$af",
                            as: "item",
                            cond: {
                                $eq: [
                                    "$$item.type",
                                    "attachements",
                                ],
                            },
                        },
                    },
                },
            },
        },
        {
            $project: {
                _id: 0,
                id: "$uuid",
                patientId: 1,
                siteId: 1,
                state: 1,
                forms: 1,
            },
        },
        {
            $project: {
                comment: 0,
                workflowTags: 0,
                "Stage Comment": 0,
                "updated at": 0,
                "updated by": 0,
                updatedAt: 0,
                updatedBy: 0,
            },
        },
        {
            $set: {
                "forms.echo.data.reliability": {
                    $first: {
                        $filter: {
                            input: "$forms.echo.data.reliability",
                            as: "r",
                            cond: {
                                $eq: ["$$r.finalized", true],
                            },
                        },
                    },
                },
                "forms.ekg.data.reliability": {
                    $first: {
                        $filter: {
                            input: "$forms.ekg.data.reliability",
                            as: "r",
                            cond: {
                                $eq: ["$$r.finalized", true],
                            },
                        },
                    },
                },
                "forms.patient.data.reliability": {
                    $first: {
                        $filter: {
                            input: "$forms.patient.data.reliability",
                            as: "r",
                            cond: {
                                $eq: ["$$r.finalized", true],
                            },
                        },
                    },
                },
                "forms.patient.data.diagnosisReliability": {
                    $first: {
                        $filter: {
                            input: "$forms.patient.data.reliability",
                            as: "r",
                            cond: {
                                $eq: ["$$r.finalized", true],
                            },
                        },
                    },
                },
            },
        },
        {
            $unset: [
                ///////////////////////////////////////////////////////////////////////////////

                "forms.echo.data.id",
                "forms.echo.data.reliability.createdAt",
                "forms.echo.data.reliability.createdBy",
                "forms.echo.data.dataUrl",
                "forms.echo.data.resolvedData",
                "forms.echo.data.changeLog",
                "forms.echo.data.dataFileName",
                "forms.echo.data.dataPath",
                "forms.echo.data.dataStorage",
                
                //////////////////////////////////////////////////////////////////////////////

                "forms.ekg.data.id",
                "forms.ekg.data.reliability.createdAt",
                "forms.ekg.data.reliability.createdBy",
                "forms.ekg.data.changeLog",
                //////////////////////////////////////////////////////////////////////////////

                "forms.patient.data.id",
                "forms.patient.data.diagnosisReliability.createdAt",
                "forms.patient.data.diagnosisReliability.createdBy",
                "forms.patient.data.reliability.createdAt",
                "forms.patient.data.reliability.createdBy",
                "forms.patient.data.diagnosis",
                "forms.patient.data.diagnosisTags.createdAt",
                "forms.patient.data.diagnosisTags.createdBy",
                "forms.patient.data.changeLog",
                "forms.patient.data.Age",
                "forms.patient.data.Sex at birth",
                "forms.patient.data.Ethnicity",
                "forms.patient.data.Height",
                "forms.patient.data.Weight",
                "forms.patient.data.Body Mass Index (BMI)",
                "forms.patient.data.Oxygen saturation",
                "forms.patient.data.Athlete",
                "forms.patient.data.Blood pressure",
                "forms.patient.data.Angina",
                "forms.patient.data.Functional class (Canadian Cardiovascular Society)",
                "forms.patient.data.patient.data.Vasospastic and resting angina pectoris",
                "forms.patient.data.Heart failure",
                "forms.patient.data.Heart failure type",
                "forms.patient.data.Functional class (NYHA)",
                "forms.patient.data.Atrial fibrillation",
                "forms.patient.data.Atrial fibrillation type",
                "forms.patient.data.At the moment of heart sound recording, AF is",
                "forms.patient.data.Atrial flutter",
                "forms.patient.data.Atrial flutter type",
                "forms.patient.data.At the time of heart sound recording, Atrial Flutter is",
                "forms.patient.data.Pregnancy",
                "forms.patient.data.Pregnancy weeks",
                "forms.patient.data.Known smoker",
                "forms.patient.data.Alcohol abuse",
                "forms.patient.data.Arterial hypertension",
                "forms.patient.data.Arterial hypertension grade",
                "forms.patient.data.Known diabetes mellitus",
                "forms.patient.data.Known hypothyroidism",
                "forms.patient.data.Known hyperthyroidism",
                "forms.patient.data.Known anemia",
                "forms.patient.data.Known cancer",
                "forms.patient.data.Known liver cirrhosis",
                "forms.patient.data.Known reduced renal function without hemodialysis or peritoneal dialysis",
                "forms.patient.data.Known hemodialysis or peritoneal dialysis",
                "forms.patient.data.Pneumonia at the time of the examination",
                "forms.patient.data.Fever or active infection at the time of examination",
                "forms.patient.data.Serious general illness at the time of examination",
                "forms.patient.data.Known bradyarrhythmias at any time",
                "forms.patient.data.Known Obliterating Disease of the Peripheral Arteries",
                "forms.patient.data.Stroke or intracranial hemorrhage at any time",
                "forms.patient.data.Successful cardiac resuscitation or sustained ventricular tachycardia in the past",
                "forms.patient.data.Rheumatic heart disease",
                "forms.patient.data.Acute coronary syndrome at the time of examination",
                "forms.patient.data.Acute coronary syndrome at the time of examination type",
                "forms.patient.data.Killip Classification",
                "forms.patient.data.Right Ventricular Infarction",
                "forms.patient.data.Past history of acute coronary syndrome",
                "forms.patient.data.year",
                "forms.patient.data.Carotid stenosis",
                "forms.patient.data.Carotid stenosis type",
                "forms.patient.data.Arterio-venous fistula",
                "forms.patient.data.Coronary angiography results (make a photo by the app)",
                "forms.patient.data.Pulmonary hypertension",
                "forms.patient.data.Pulmonary Embolism",
                "forms.patient.data.Cardiomyopathy",
                "forms.patient.data.Cardiomyopathy Type",
                "forms.patient.data.Myocarditis",
                "forms.patient.data.Infective Endocarditis",
                "forms.patient.data.Pericarditis",
                "forms.patient.data.Left Ventricular Noncompaction",
                "forms.patient.data.Leg edema",
                "forms.patient.data.Ascites",
                "forms.patient.data.Congestive rales",
                "forms.patient.data.Signs of bronchoobstruction and respiratory failure",
                "forms.patient.data.Known respiratory failure of any cause",
                "forms.patient.data.Present respiratory diseases",
                "forms.patient.data.Changes in procedure of sound recording",
                "forms.patient.data.Clinical diagnosis",
                //////////////////////////////////////////////////////////////////////////////////

                "forms.attachements",
                //////////////////////////////////////////////////////////////////////////////////
                "userId",
                "createdAt",
                "synchronizedAt",
                // "patientId",
            ],
        },
    ]
})