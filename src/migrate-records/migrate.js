const execute = require("./utils/migrate-records")

const COLLECTION = "sparrow.taged-records"

const run = async () => {
  await execute(COLLECTION)
}

run()
