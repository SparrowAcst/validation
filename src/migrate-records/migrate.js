const execute = require("./utils/migrate-records")

const COLLECTION = "sparrow.harvest1"

const run = async () => {
  await execute(COLLECTION)
}

run()
