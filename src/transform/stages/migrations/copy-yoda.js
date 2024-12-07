module.exports = [
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

]