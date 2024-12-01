module.exports = [

    /////////////////////////////////////////////////////////////////////////////
    {
        source: "strazhesko-part-1.labels",
        dest: `strazhesko-part-1-mix.labels`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: "strazhesko-part-1.examinations",
        dest: `strazhesko-part-1-mix.examinations`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

/////////////////////////////////////////////////////////////////////////////
    {
        source: "potashev-part-1.labels",
        dest: `potashev-part-1-mix.labels`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: "potashev-part-1.examinations",
        dest: `potashev-part-1-mix.examinations`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },
/////////////////////////////////////////////////////////////////////////////
    {
        source: "denis-part-1.labels",
        dest: `denis-part-1-mix.labels`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: "denis-part-1.examinations",
        dest: `denis-part-1-mix.examinations`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },
/////////////////////////////////////////////////////////////////////////////
    {
        source: "poltava-part-1.labels",
        dest: `poltava-part-1-mix.labels`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: "poltava-part-1.examinations",
        dest: `poltava-part-1-mix.examinations`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

/////////////////////////////////////////////////////////////////////////////
    {
        source: "phonendo.labels",
        dest: `phonendo-mix.labels`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: "phonendo.examinations",
        dest: `phonendo-mix.examinations`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },


/////////////////////////////////////////////////////////////////////////////
    {
        source: "digiscope.labels",
        dest: `digiscope-mix.labels`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: "digiscope.examinations",
        dest: `digiscope-mix.examinations`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

/////////////////////////////////////////////////////////////////////////////
    {
        source: "yoda.labels",
        dest: `yoda-mix.labels`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: "yoda.examinations",
        dest: `yoda-mix.examinations`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

/////////////////////////////////////////////////////////////////////////////
    {
        source: "hha.labels",
        dest: `hha-mix.labels`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: "hha.examinations",
        dest: `hha-mix.examinations`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

/////////////////////////////////////////////////////////////////////////////
    {
        source: "harvest1.labels",
        dest: `harvest1-mix.labels`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: "harvest1.examinations",
        dest: `harvest1-mix.examinations`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    }


  

]