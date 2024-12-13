const execute = require("./utils/migrate-records")

const COLLECTION = "sparrow.hha"

const run = async () => {
  await execute(COLLECTION)
}

run()
