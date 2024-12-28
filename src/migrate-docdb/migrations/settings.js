module.exports = [

    /////////////////////////////////////////////////////////////////////////////

    {
        source: `ADE-SETTINGS.app-grants`,
        dest: `ADE-SETTINGS.app-grants`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: `ADE-SETTINGS.datasets`,
        dest: `ADE-SETTINGS.datasets`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: `ADE-SETTINGS.metadata`,
        dest: `ADE-SETTINGS.metadata`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },    

    {
        source: `ADE-SETTINGS.profiles`,
        dest: `ADE-SETTINGS.profiles`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: `ADE-SETTINGS.segmentation-request-cache`,
        dest: `ADE-SETTINGS.segmentation-request-cache`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: `ADE-SETTINGS.segmentation-requests`,
        dest: `ADE-SETTINGS.segmentation-requests`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: `ADE-SETTINGS.sites`,
        dest: `ADE-SETTINGS.sites`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: `ADE-SETTINGS.tags`,
        dest: `ADE-SETTINGS.tags`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

    {
        source: `ADE-SETTINGS.workflow-tags`,
        dest: `ADE-SETTINGS.workflow-tags`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },


    ////////////////////////////////////////////////////////////////////////////////////


]