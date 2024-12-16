module.exports = (schema, suffix) => ([

    /////////////////////////////////////////////////////////////////////////////

    {
        source: `${schema}${suffix}.labels`,
        dest: `${schema}.labels`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },


    {
        source: `${schema}${suffix}.examinations`,
        dest: `${schema}.examinations`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    ////////////////////////////////////////////////////////////////////////////////////


])