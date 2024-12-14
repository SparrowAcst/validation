const execute = require("./utils/migrate-records")

const COLLECTION = "sparrow.arabia-labels"

const run = async () => {
  await execute(COLLECTION)
}

run()
