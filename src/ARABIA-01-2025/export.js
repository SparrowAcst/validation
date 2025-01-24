const { keys, sortBy, groupBy, last, first } = require("lodash")
const path = require("path")
const fs = require("fs")

const prefix2Spot = {
    A: "Aortic area",
    T: "Tricuspid area",
    P: "Pulmonic area",
    M: "Mitral area",
}

const parse = value => {

    const id = last(value.split("/"))
    let parts = id.split("_")
    const bodySpot = prefix2Spot[parts.shift()]
    parts.pop()
    const topic = parts.join("_")
    return {
        id,
        bodySpot,
        topic
    }

}

let data = require("./arabia-labels.json")

data = groupBy(data, d => parse(d.path).topic)

keys(data).filter(key => key).forEach(key => {
    
    let result = data[key].map(d => ({
        id: parse(d.path).id,
        bodySpot: parse(d.path).bodySpot,
        segmenation: {
            S1: (d.segmentation.S1 || []).map(s => ({ start: s[0], end: s[1] })),
            S2: (d.segmentation.S2 || []).map(s => ({ start: s[0], end: s[1] })),
            syslole: (d.segmentation.systole || []).map(s => ({ start: s[0], end: s[1] })),
            diastole: (d.segmentation.diastole || []).map(s => ({ start: s[0], end: s[1] })),
            unsegmentable: (d.segmentation.unsegmentable || []).map(s => ({ start: s[0], end: s[1] }))
        },
        systolicMurmurs: !(d["Systolic murmurs"].length > 0 && d["Systolic murmurs"][0].type == "No systolic murmurs"),
        diastolicMurmurs: !(d["Diastolic murmurs"].length > 0 && d["Diastolic murmurs"][0].type == "No diastolic murmurs"),
        constantMurmurs: d["Other murmurs"].length > 0 && d["Other murmurs"].map(m => m.type).includes("Constant Murmur")
    }))

    fs.writeFileSync(`${key}.json`, JSON.stringify(result, null, " "))

})

