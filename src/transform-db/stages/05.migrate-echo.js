const execute = require("../utils/migrate-echo")

const SCHEMA = "HH3"

const run = async () => {
  await execute(SCHEMA)
}

run()

