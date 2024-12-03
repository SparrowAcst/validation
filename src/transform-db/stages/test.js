const {difference} = require("lodash")


let p1 = require("./stages/P1").map( d => d.patientId)
let p2 = require("./stages/P2").map( d => d.patientId)


console.log("p1-p2", difference(p1, p2))

console.log("p2-p1", difference(p2, p1))
