const execute = require("./utils/migrate-records")

const COLLECTION = "sparrow.vintage"

const run = async () => {
  await execute(COLLECTION)
}

run()
