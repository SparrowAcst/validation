
const { keys, sortBy, groupBy, last } = require("lodash")
const path = require("path")
const fs = require("fs")


let data = require("./arabia-labels.json")

let result = data.map( d => ({
    id: last(d.path.split("/")),
    segmenation:{
      S1: (d.segmentation.S1 || []).map(s => ({start: s[0], end: s[1]})),
      S2: (d.segmentation.S2 || []).map(s => ({start: s[0], end: s[1]})),
      unsegmentable: (d.segmentation.unsegmentable || []).map(s => ({start: s[0], end: s[1]}))
    },
    systolicMurmurs: !(d["Systolic murmurs"].length > 0 && d["Systolic murmurs"][0].type == "No systolic murmurs"),
    diastolicMurmurs: !(d["Diastolic murmurs"].length > 0 && d["Diastolic murmurs"][0].type == "No diastolic murmurs"),
    constantMurmurs: d["Other murmurs"].length > 0 && d["Other murmurs"].map(m => m.type).includes("Constant Murmur")
}))

console.log(JSON.stringify(result, null, " "))