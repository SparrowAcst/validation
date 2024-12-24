const execute = require("./utils/migrate-records")

const COLLECTION = "sparrow.innocent-reallife-labels"

const run = async () => {
  await execute(COLLECTION)
}

run()
