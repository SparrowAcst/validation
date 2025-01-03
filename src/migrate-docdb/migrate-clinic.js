


const execute = require("./utils/migrate-clinic")

const migrations = [
	// {
 //        source: `sparrow-clinic.users`,
 //        dest: `sparrow-clinic.users`,
 //        pipeline: [
 //            {
 //                $project: {
 //                    _id: 0
 //                }
 //            }
 //        ]
 //    },
    {
        source: `sparrow-clinic.users-dev`,
        dest: `sparrow-clinic.users-dev`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },
    {
        source: `sparrow-clinic.validation-rules`,
        dest: `sparrow-clinic.validation-rules`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },
    {
        source: `sparrow-clinic.forms`,
        dest: `sparrow-clinic.forms`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },
    {
        source: `sparrow-clinic.i18n`,
        dest: `sparrow-clinic.i18n`,
        pipeline: [
            {
                $project: {
                    _id: 0
                }
            }
        ]
    },
    // {
    //     source: `sparrow-clinic.organizations`,
    //     dest: `sparrow-clinic.organizations`,
    //     pipeline: [
    //         {
    //             $project: {
    //                 _id: 0
    //             }
    //         }
    //     ]
    // }
]


const run = async () => {

	await execute(migrations)		
	
}

run()

