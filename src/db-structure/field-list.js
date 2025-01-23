const {keys, sortBy} = require("lodash")

const run = async () => {

  const {flatten} = await import("flat")

  let examination = require("./examination.example.json")
  let labels = require("./labels.example.json")

  labels = flatten(labels)
  let fields = sortBy(keys(labels))
  fields.forEach( key => {
    console.log(key)
  })

}

run()