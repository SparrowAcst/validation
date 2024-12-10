const execute = require("./utils/migrate-records")

const COLLECTION = "sparrow.H2"

const run = async () => {
  await execute(COLLECTION)
}

run()
