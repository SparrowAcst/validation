const execute = require("../utils/migrate")

const migrations = require("./migrations/restore-HH1")

const run = async () => {
  await execute(migrations)
}

run()


