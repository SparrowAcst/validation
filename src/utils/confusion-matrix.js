const { ConfusionMatrix } = require('ml-confusion-matrix')
const sample = require( '@stdlib/random-sample' )
const percentile = require("percentile")


const range = (start, end, step = 1) => {
  if(!end){
      end = start + 1
  } else {
      end++
  }
  
  return Array.from(
        { length: Math.ceil((end - start) / step) },
        (_, i) => i * step + start
     )
}


const mapData = (indexes, data) => {
  let res = []
  indexes.forEach( index => {
    res.push(data[index])
  })
  return res
}


const matrix2Obj = m => ({
  tn: m[1][1],
  fp: m[1][0],
  fn: m[0][1],
  tp: m[0][0]
})


const evaluation = {
  
  Kappa:  m => {
    let n = m.tp + m.tn + m.fp + m.fn
    let p0 = (m.tp + m.tn)/n
    let pe = (( m.tp + m.fp ) * ( m.tp + m.fn ) + ( m.tn + m.fn ) * ( m.tn + m.fp ))/(n*n) 

    return ( p0 - pe ) / ( 1 - pe )
  },

  Accuracy: m => {
    return (m.tp + m.tn)/(m.tp + m.tn + m.fp + m.fn)
  },

  Sensivity: m => {
    return m.tp / (m.tp + m.fp)
  },

  Specificity: m => {
       return m.tn / (m.tn + m.fn)
  },


}



const evaluate = ( reference, prediction, metric, label, iteration = 5000,  ) => {
  label = label || "present"
  let metricPool = []

  for(let i=0; i< iteration; i++){
    
    let indexes = sample( range(0, reference.length-1), {size: reference.length})
    let ref_ = mapData(indexes, reference)
    let pred_ = mapData(indexes, prediction)
    let m = ConfusionMatrix.fromLabels(ref_, pred_)
    let matrix = matrix2Obj(m.getConfusionTable(label))

    let value = evaluation[metric](matrix)
    
    metricPool.push(value)

  }

  let res_m = ConfusionMatrix.fromLabels(reference, prediction)
  let ci = percentile([2.5, 97.5], metricPool)
  let matrix = matrix2Obj(res_m.getConfusionTable(label))
  return {
    matrix,
    value: evaluation[metric](matrix),
    ci
  }

} 



module.exports = evaluate



