const execute = require("../utils/migrate")

const migrations = require("./migrations/copy-done")

const run = async () => {
  await execute(migrations)
}

run()

