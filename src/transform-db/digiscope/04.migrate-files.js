const execute = require("../utils/migrate-files")

const SCHEMA = "HH3"

const run = async () => {
  await execute(SCHEMA)
}

run()
