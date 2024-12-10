const execute = require("./utils/migrate-records")

const COLLECTION = "sparrow.digiscope"

const run = async () => {
  await execute(COLLECTION)
}

run()
