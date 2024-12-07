const execute = require("../utils/migrate")

const migrations = require("./migrations/copy-to-mix")

const run = async () => {
  await execute(migrations)
}

run()

