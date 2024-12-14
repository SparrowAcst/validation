const execute = require("./utils/migrate-records")

const COLLECTION = "sparrow.phonendo"

const run = async () => {
  await execute(COLLECTION)
}

run()
