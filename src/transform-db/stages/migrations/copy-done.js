module.exports = [

    /////////////////////////////////////////////////////////////////////////////
    {
        source: "strazhesko-part-1-done.labels",
        dest: `strazhesko-part-1-mix.labels`,
        pipeline: [
            {
                $project: {
                    _id: 0,
                    "Examination ID": 0
                }
            }
        ]
    },

    {
        source: "strazhesko-part-1-done.examinations",
        dest: `strazhesko-part-1-mix.examinations`,
        pipeline: [
            {
                $project: {
                    _id: 0,
                    af: 0
                }
            }
        ]
    },

/////////////////////////////////////////////////////////////////////////////
    {
        source: "potashev-part-1-done.labels",
        dest: `potashev-part-1-mix.labels`,
        pipeline: [
            {
                $project: {
                    _id: 0,
                    "Examination ID": 0
                }
            }
        ]
    },

    {
        source: "potashev-part-1-done.examinations",
        dest: `potashev-part-1-mix.examinations`,
        pipeline: [
            {
                $project: {
                    _id: 0,
                    af: 0
                }
            }
        ]
    },
/////////////////////////////////////////////////////////////////////////////
    {
        source: "denis-part-1-done.labels",
        dest: `denis-part-1-mix.labels`,
        pipeline: [
            {
                $project: {
                    _id: 0,
                    "Examination ID": 0
                }
            }
        ]
    },

    {
        source: "denis-part-1-done.examinations",
        dest: `denis-part-1-mix.examinations`,
        pipeline: [
            {
                $project: {
                    _id: 0,
                    af: 0
                }
            }
        ]
    },
/////////////////////////////////////////////////////////////////////////////
    {
        source: "poltava-part-1-done.labels",
        dest: `poltava-part-1-mix.labels`,
        pipeline: [
            {
                $project: {
                    _id: 0,
                    "Examination ID": 0
                }
            }
        ]
    },

    {
        source: "poltava-part-1-done.examinations",
        dest: `poltava-part-1-mix.examinations`,
        pipeline: [
            {
                $project: {
                    _id: 0,
                    af: 0
                }
            }
        ]
    },

/////////////////////////////////////////////////////////////////////////////
    {
        source: "phonendo-done.labels",
        dest: `phonendo-mix.labels`,
        pipeline: [
            {
                $project: {
                    _id: 0,
                    "Examination ID": 0
                }
            }
        ]
    },

    {
        source: "phonendo-done.examinations",
        dest: `phonendo-mix.examinations`,
        pipeline: [
            {
                $project: {
                    _id: 0,
                    af: 0
                }
            }
        ]
    },


/////////////////////////////////////////////////////////////////////////////
    {
        source: "digiscope-done.labels",
        dest: `digiscope-mix.labels`,
        pipeline: [
            {
                $project: {
                    _id: 0,
                    "Examination ID": 0
                }
            }
        ]
    },

    {
        source: "digiscope-done.examinations",
        dest: `digiscope-mix.examinations`,
        pipeline: [
            {
                $project: {
                    _id: 0,
                    af: 0
                }
            }
        ]
    },

/////////////////////////////////////////////////////////////////////////////
    {
        source: "yoda-done.labels",
        dest: `yoda-mix.labels`,
        pipeline: [
            {
                $project: {
                    _id: 0,
                    "Examination ID": 0
                }
            }
        ]
    },

    {
        source: "yoda-done.examinations",
        dest: `yoda-mix.examinations`,
        pipeline: [
            {
                $project: {
                    _id: 0,
                    af: 0
                }
            }
        ]
    },

/////////////////////////////////////////////////////////////////////////////
    {
        source: "hha-done.labels",
        dest: `hha-mix.labels`,
        pipeline: [
            {
                $project: {
                    _id: 0,
                    "Examination ID": 0
                }
            }
        ]
    },

    {
        source: "hha-done.examinations",
        dest: `hha-mix.examinations`,
        pipeline: [
            {
                $project: {
                    _id: 0,
                    af: 0
                }
            }
        ]
    },

/////////////////////////////////////////////////////////////////////////////
    {
        source: "harvest1-done.labels",
        dest: `harvest1-mix.labels`,
        pipeline: [
            {
                $project: {
                    _id: 0,
                    "Examination ID": 0
                }
            }
        ]
    },

    {
        source: "harvest1-done.examinations",
        dest: `harvest1-mix.examinations`,
        pipeline: [
            {
                $project: {
                    _id: 0,
                    af: 0
                }
            }
        ]
    }


  

]