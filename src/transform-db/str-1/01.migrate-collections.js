const execute = require("../utils/migrate")

const migrations = require("./migrations/str-1")

const run = async () => {
  await execute(migrations)
}

run()

