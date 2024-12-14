const execute = require("./utils/migrate-records")

const COLLECTION = "sparrow.vinil"

const run = async () => {
  await execute(COLLECTION)
}

run()
