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






















[
  //   {
  //   $match:
  //     {
  //       $expr: {
  //         $ne: [
  //           "$Examination ID",
  //           "$src.Examination ID",
  //         ],
  //       },
  //     },
  // },
  {
    $project: {
      _id: 0,
      id: 1,
      "Examination ID": 1,
      collection: "strazhesko-part-1.labels",
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
]




/// examination cross matrix

[
  {
    $group: {
      _id: "$src.Examination ID",
      "Examination ID": {
        $first: "$Examination ID",
      },
      src: {
        $first: "$src",
      },
    },
  },
  {
    $lookup: {
      from: "examinations",
      localField: "Examination ID",
      foreignField: "patientId",
      as: "examination",
      pipeline: [
        {
          $project: {
            _id: 0,
            crashed: 1,
            id: "$uuid",
            patientId: "$patientId",
            src: 1,
          },
        },
      ],
    },
  },
  {
    $addFields: {
      crashed: {
        $first: "$examination.crashed",
      },
      id: {
        $first: "$examination.id",
      },
      collection: {
        $first: "$examination.src.collection",
      },
    },
  },
  {
    $addFields: {
      source: {
        patientId: "$src.Examination ID",
        collection: "$collection",
      },
      target: {
        id: "$id",
        patientId: "$Examination ID",
        collection: "ADE-TRANSFORM.examinations",
      },
    },
  },
  {
    $project: {
      _id: 0,
      source: 1,
      target: 1,
      crashed: 1,
    },
  },
]