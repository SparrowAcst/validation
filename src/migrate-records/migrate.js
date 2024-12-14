const execute = require("./utils/migrate-records")

const COLLECTION = "sparrow.clinic4"

const run = async () => {
  await execute(COLLECTION)
}

run()
