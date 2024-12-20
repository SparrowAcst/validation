const execute = require("./utils/sync-exams")

const SCHEMA = "strazhesko-part-1"

const run = async () => {
  await execute(SCHEMA)
}

run()

