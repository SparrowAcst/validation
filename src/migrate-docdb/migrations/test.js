module.exports = [

    /////////////////////////////////////////////////////////////////////////////
    {
        source: "sparrow.H2",
        dest: `strazhesko-part-1-1.labels`,
        pipeline: [{
                $match: {
                    Clinic: "STRAZHESKO"
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: "sparrow.H2-EXAMINATION",
        dest: `strazhesko-part-1-1.examinations`,
        pipeline: [{
                $match: {
                    siteId: "c42ac1bd-ae37-4a47-b431-44cf4d886be1"
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },



    ////////////////////////////////////////////////////////////////////////////////////


]