module.exports = [

    {
        source: "sparrow.yoda",
        dest: `ADE-ENCODING.yoda-records`,
        pipeline: [{
            $project: {
                _id: 0,
                id: 1,
                path: 1
            }
        }]
    },
    {
        source: "sparrow.vintage",
        dest: `ADE-ENCODING.vintage-records`,
        pipeline: [{
            $project: {
                _id: 0,
                id: 1,
                path: 1
            }
        }]
    },
    {
        source: "sparrow.vinil",
        dest: `ADE-ENCODING.vinil-records`,
        pipeline: [{
            $project: {
                _id: 0,
                id: 1,
                path: 1
            }
        }]
    },
    {
        source: "sparrow.stethophone-app",
        dest: `ADE-ENCODING.stethophone-app-records`,
        pipeline: [{
            $project: {
                _id: 0,
                id: 1,
                path: 1
            }
        }]
    },
    {
        source: "sparrow.phonendo",
        dest: `ADE-ENCODING.phonendo-records`,
        pipeline: [{
            $project: {
                _id: 0,
                id: 1,
                path: 1
            }
        }]
    },
    {
        source: "sparrow.phisionet",
        dest: `ADE-ENCODING.phisionet-records`,
        pipeline: [{
            $project: {
                _id: 0,
                id: 1,
                path: 1
            }
        }]
    },
    {
        source: "sparrow.hha",
        dest: `ADE-ENCODING.hha-records`,
        pipeline: [{
            $project: {
                _id: 0,
                id: 1,
                path: 1
            }
        }]
    },
    {
        source: "sparrow.hha",
        dest: `ADE-ENCODING.hha-records`,
        pipeline: [{
            $project: {
                _id: 0,
                id: 1,
                path: 1
            }
        }]
    },
    {
        source: "sparrow.digiscope",
        dest: `ADE-ENCODING.digiscope-records`,
        pipeline: [{
            $project: {
                _id: 0,
                id: 1,
                path: 1
            }
        }]
    },
    {
        source: "sparrow.digiscope",
        dest: `ADE-ENCODING.digiscope-records`,
        pipeline: [{
            $project: {
                _id: 0,
                id: 1,
                path: 1
            }
        }]
    },
    {
        source: "sparrow.harvest1",
        dest: `ADE-ENCODING.hh1-records`,
        pipeline: [{
            $project: {
                _id: 0,
                id: 1,
                path: 1
            }
        }]
    },
    {
        source: "sparrow.clinic4",
        dest: `ADE-ENCODING.clinic4-records`,
        pipeline: [{
            $project: {
                _id: 0,
                id: 1,
                path: 1
            }
        }]
    },
    {
        source: "sparrow.H2",
        dest: `ADE-ENCODING.strazhesko-part-1-records`,
        pipeline: [{
                $match: {
                    Clinic: "STRAZHESKO"
                }
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    path: 1
                }
            }
        ]
    },
    {
        source: "sparrow.H2",
        dest: `ADE-ENCODING.potashev-part-1-records`,
        pipeline: [{
                $match: {
                    Clinic: "POTASHEV"
                }
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    path: 1
                }
            }
        ]
    },
    {
        source: "sparrow.H2",
        dest: `ADE-ENCODING.denis-part-1-records`,
        pipeline: [{
                $match: {
                    Clinic: "Denis"
                }
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    path: 1
                }
            }
        ]
    },
    {
        source: "sparrow.H2",
        dest: `ADE-ENCODING.poltava-part-1-records`,
        pipeline: [{
                $match: {
                    Clinic: "POLTAVA"
                }
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    path: 1
                }
            }
        ]
    }

]