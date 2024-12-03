const {difference} = require("lodash")


let p1 = require("./stages/P1").map( d => d.patientId)
let e2 = require("./stages/E2").map( d => d.patientId)


console.log("p1-e2", difference(p1, e2))

console.log("e2-p1", difference(e2, p1))
