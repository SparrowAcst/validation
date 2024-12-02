module.exports = [
	{
        source: "TEST_CLINIC.labels",
        dest: `sparrow.H3`,
        pipeline: [
            {
            	$match:{
            		migrated: {
            			$exists: false
            		}
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
        source: "TEST_CLINIC.examinations",
        dest: `sparrow.H3-EXAMINATION`,
        pipeline: [
            {
            	$match:{
            		migrated: {
            			$exists: false
            		}
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
        source: "TEST_CLINIC.segmentations",
        dest: `sparrow.H3-SEGMENTATION`,
        pipeline: [
            {
            	$match:{
            		migrated: {
            			$exists: false
            		}
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
        source: "TEST_CLINIC.forms",
        dest: `sparrow.H3-FORM`,
        pipeline: [
            {
            	$match:{
            		migrated: {
            			$exists: false
            		}
            	}
            },
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },

]

