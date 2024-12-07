const execute = require("../utils/migrate")

const migrations = require("./migrations")

const run = async () => {
  await execute(migrations)
}

run()

