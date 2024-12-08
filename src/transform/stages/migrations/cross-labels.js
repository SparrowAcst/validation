module.exports = (schema, out) => [{
        source: `${schema}.labels`,
        dest: `${out}.labels`,
        pipeline: [
  {
    $project: {
      _id: 0,
      id: 1,
      "Examination ID": 1,
      collection: "ADE-TRANSFORM.labels",
      src: 1,
    },
  },
  {
    $addFields: {
      backward: {
        source: {
          id: "$id",
          "Examination ID": "$Examination ID",
          collection: "$collection",
        },
        target: "$src",
      },
      forward: {
        source: "$src",
        target: {
          id: "$id",
          "Examination ID": "$Examination ID",
          collection: "$collection",
        },
      },
    },
  },
  {
    $project: {
      forward: 1,
      backward: 1,
    },
  },
  // {
  //   $match:
  //     /**
  //      * query: The query in MQL.
  //      */
  //     {
  //       $expr: {
  //         $ne: [
  //           "$backward.source.Examination ID",
  //           "$backward.target.Examination ID",
  //         ],
  //       },
  //     },
  // }
]
    },


]