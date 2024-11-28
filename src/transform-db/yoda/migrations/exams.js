module.exports = [

    {
        source: "sparrow.yoda-exams",
        dest: `ADE-ENCODING.yoda-examinations`,
        pipeline: [{
            $project: {
                _id: 0,
                id: "$uuid",
                patientId: 1
            }
        }]
    },
    {
        source: "sparrow.vintage-exam",
        dest: `ADE-ENCODING.vintage-examinations`,
        pipeline: [{
            $project: {
                _id: 0,
                id: "$uuid",
                patientId: 1
            }
        }]
    },
    {
        source: "sparrow.vinil-exams",
        dest: `ADE-ENCODING.vinil-examinations`,
        pipeline: [{
            $project: {
                _id: 0,
                id: "$uuid",
                patientId: 1
            }
        }]
    },
    {
        source: "sparrow.stethophone-app-exams",
        dest: `ADE-ENCODING.stethophone-app-examinations`,
        pipeline: [{
            $project: {
                _id: 0,
                id: "$uuid",
                patientId: 1
            }
        }]
    },
    {
        source: "sparrow.phonendo-exams",
        dest: `ADE-ENCODING.phonendo-examinations`,
        pipeline: [{
            $project: {
                _id: 0,
                id: "$uuid",
                patientId: 1
            }
        }]
    },
    {
        source: "sparrow.phisionet-exams",
        dest: `ADE-ENCODING.phisionet-examinations`,
        pipeline: [{
            $project: {
                _id: 0,
                id: "$uuid",
                patientId: 1
            }
        }]
    },
    {
        source: "sparrow.hha-examination",
        dest: `ADE-ENCODING.hha-examinations`,
        pipeline: [{
            $project: {
                _id: 0,
                id: "$uuid",
                patientId: 1
            }
        }]
    },
    {
        source: "sparrow.digiscope-exams",
        dest: `ADE-ENCODING.digiscope-examinations`,
        pipeline: [{
            $project: {
                _id: 0,
                id: "$uuid",
                patientId: 1
            }
        }]
    },
    {
        source: "sparrow.examination",
        dest: `ADE-ENCODING.hh1-examinations`,
        pipeline: [{
            $project: {
                _id: 0,
                id: "$uuid",
                patientId: 1
            }
        }]
    },
    {
        source: "sparrow.clinic4-exam",
        dest: `ADE-ENCODING.clinic4-examinations`,
        pipeline: [{
            $project: {
                _id: 0,
                id: "$uuid",
                patientId: 1
            }
        }]
    },
    {
        source: "sparrow.H2-EXAMINATION",
        dest: `ADE-ENCODING.strazhesko-part-1-examinations`,
        pipeline: [{
                $match: {
                    Clinic: "STRAZHESKO"
                }
            },
            {
                $project: {
                    _id: 0,
                    id: "$uuid",
                    patientId: 1
                }
            }
        ]
    },
    {
        source: "sparrow.H2-EXAMINATION",
        dest: `ADE-ENCODING.potashev-part-1-examinations`,
        pipeline: [{
                $match: {
                    Clinic: "POTASHEV"
                }
            },
            {
                $project: {
                    _id: 0,
                    id: "$uuid",
                    patientId: 1
                }
            }
        ]
    },
    {
        source: "sparrow.H2-EXAMINATION",
        dest: `ADE-ENCODING.denis-part-1-examinations`,
        pipeline: [{
                $match: {
                    Clinic: "Denis"
                }
            },
            {
                $project: {
                    _id: 0,
                    id: "$uuid",
                    patientId: 1
                }
            }
        ]
    },
    {
        source: "sparrow.H2-EXAMINATION",
        dest: `ADE-ENCODING.poltava-part-1-examinations`,
        pipeline: [{
                $match: {
                    Clinic: "POLTAVA"
                }
            },
            {
                $project: {
                    _id: 0,
                    id: "$uuid",
                    patientId: 1
                }
            }
        ]
    }

]