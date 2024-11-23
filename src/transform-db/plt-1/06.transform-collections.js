
const execute = require("../utils/transform-collections")

const SCHEMA = "HH3"
const stages = require("./stages/all")

const run = async () => {
  await execute(SCHEMA, stages)
}

run()

