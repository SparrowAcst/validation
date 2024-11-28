module.exports = [

    {
        source: "sparrow.yoda",
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
        source: "sparrow.vintage",
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
        source: "sparrow.vinil",
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
        source: "sparrow.stethophone-app",
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
        source: "sparrow.phonendo",
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
        source: "sparrow.phisionet",
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
        source: "sparrow.hha",
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
        source: "sparrow.hha",
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
        source: "sparrow.digiscope",
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
        source: "sparrow.harvest1",
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
        source: "sparrow.clinic4",
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
        source: "sparrow.H2",
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
        source: "sparrow.H2",
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
        source: "sparrow.H2",
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
        source: "sparrow.H2",
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