
const execute = require("../utils/transform-collections")

const SCHEMA = "HH1"
const stages = require("./stages/prepare-attachements")

const run = async () => {
  await execute(SCHEMA, stages)
}

run()

