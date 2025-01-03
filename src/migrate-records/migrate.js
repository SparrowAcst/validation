const execute = require("./utils/migrate-records")

const COLLECTION = "sparrow.H3"

const run = async () => {
  await execute(COLLECTION)
}

run()
