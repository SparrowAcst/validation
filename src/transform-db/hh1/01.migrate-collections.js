const execute = require("../utils/migrate")

const migrations = require("./migrations/hh1")

const run = async () => {
  await execute(migrations)
}

run()

