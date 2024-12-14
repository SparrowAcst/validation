const execute = require("./utils/migrate-records")

const COLLECTION = "sparrow.stethophone-app"

const run = async () => {
  await execute(COLLECTION)
}

run()
