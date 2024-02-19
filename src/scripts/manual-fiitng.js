window.app = {
    widget: {
        chart: selectWidgets("o2s6c6tpeme"),
        textarea: selectWidgets("jnsn2k48xt"),
        select: selectWidgets("09er3hrswbap")
    },
    data:{
        text: "Insert data here...",
        sourceData: [],
        patients: [],
        option: {},
        shiftStart: 0
    }
}




///////////////////////////////////////////////////////////////////////////////////

// const text2data = text => {
    
//     text = text.split("\n")
    
//     let header = text.splice(0,1).split("\t").map(d => d.trim())
    
//     let result = text.map( t => {
    
//         t = t.split("\t").map(d =>d.trim())
//         let r = {}
    
//         header.forEach( (h, index) => {
    
//             r[h] = t[index]
//             if (h =="start") {
//                 r[h] = Number.parseFloat(r[h])
//             }
    
//             return r
//         })
    
        
//     })
    
//     return result

// }


///////////////////////////////////////////////////////////////////////////////////


// this.on({
//     event: "import-source",
//     callback: () => {
//         console.log(window.app.data.text)
//     }
// })



// setTimeout(() => {
//     window.app.widget.chart.update({data: window.app.data.option})
//     window.app.widget.textarea.update({data: window.app.data, override:"options.data"})
//     window.app.widget.select.update({data: window.app.data, override:"options.data"})
    
// }, 500)




///////////////////////////////////////////////////////////////////////////////////

var data = [];
var dataCount = 10;
var startTime = +new Date();
var categories = ['categoryA', 'categoryB'];
var types = [
  { name: 'JS Heap', color: '#7b9ce1' },
  { name: 'Documents', color: '#bd6d6c' },
  { name: 'Nodes', color: '#75d874' },
  { name: 'Listeners', color: '#e0bc78' },
  { name: 'GPU Memory', color: '#dc77dc' },
  { name: 'GPU', color: '#72b362' }
];
// Generate mock data
categories.forEach(function (category, index) {
  var baseTime = startTime + Math.round(Math.random() * 10000);
  for (var i = 0; i < dataCount; i++) {
    var typeItem = types[Math.round(Math.random() * (types.length - 1))];
    var duration = Math.round(Math.random() * 10000);
    data.push({
      name: typeItem.name,
      value: [index, baseTime, (baseTime += duration), duration],
      itemStyle: {
        normal: {
          color: typeItem.color
        }
      }
    });
    baseTime += Math.round(Math.random() * 2000);
  }
});
function renderItem(params, api) {
  var categoryIndex = api.value(0);
  var start = api.coord([api.value(1), categoryIndex]);
  var end = api.coord([api.value(2), categoryIndex]);
  var height = api.size([0, 1])[1] * 0.99;
  var rectShape = echarts.graphic.clipRectByRect(
    {
      x: start[0],
      y: start[1] - height / 2,
      width: end[0] - start[0],
      height: height
    },
    {
      x: params.coordSys.x,
      y: params.coordSys.y,
      width: params.coordSys.width,
      height: params.coordSys.height
    }
  );
  return (
    rectShape && {
      type: 'rect',
      transition: ['shape'],
      shape: rectShape,
      style: api.style()
    }
  );
}
let option = {
  tooltip: {
    // trigger: 'axis',
    formatter: function (params) {
      return params.marker + params.name + ': ' + params.value[0]+' '+params.value[1]+' '+params.value[2] + " "+ params.value[3] +' ms';
    },
    axisPointer: {
      show: true,
      type: 'cross',
      lineStyle: {
        type: 'dashed',
        width: 1
      }
    }
  },
  dataZoom: [
    {
      type: 'slider',
      filterMode: 'weakFilter',
      showDataShadow: false,
      top: 400,
      labelFormatter: ''
    },
    {
      type: 'inside',
      filterMode: 'weakFilter'
    }
  ],
  grid: {
    // height: 300,
    left:10,
    right:10,
    top:10
  },
  xAxis: {
    min: startTime,
    scale: true,
    axisLabel: {
      formatter: function (val) {
        return val  + ' ms';
      }
    }
  },
  yAxis: {
    data: categories
  },
  series: [
    {
      type: 'custom',
      renderItem: renderItem,
      itemStyle: {
        opacity: 0.6
      },
      encode: {
        x: [1, 2],
        y: 0
      },
      data: data
    }
  ]
};


// window.app.widget.chart.update({data: window.app.data.option})