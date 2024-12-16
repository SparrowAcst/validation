const execute = require("./utils/migrate")

const migrations = require("./migrations/settings")


const SUFFIX = "-done"

const run = async () => {
	await execute(migrations)		
 
}

run()

