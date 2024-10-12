const axios = require("axios")

// const SYNC_URL_V3 = "https://35h7sworkec6bwn3oxj4rvvjqe0bkhtn.lambda-url.us-east-1.on.aws/"
// // const DATASETS_V3 = require("../json/import-v3")

// const SYNC_URL_V2 = "https://35h7sworkec6bwn3oxj4rvvjqe0bkhtn.lambda-url.us-east-1.on.aws/"
// // const DATASETS_V2 = require("../json/import-v2")


const SYNC_URL = "https://f2widtdjmjfyutl3aunyzv4tmu0kzwio.lambda-url.us-east-1.on.aws/"

const DATASETS = require("./datasets").map( d => d.sync)

// [

//     {
//         "stVersion": 2,
//         "record_folder_id": "1t00v1xVfVmqxc0YpKKdcDfLEshAO1_7s",
//         "examination_folder_id": "1BUJ0UL-NSPIC2oSUgrf2XqJlnFVKpCwd",
//         "folder": "v2-i16-rt-MtM",
//         "template": "v2-i16-rt-MtM-%"
//     },
//     {
//         "stVersion": 2,
//         "record_folder_id": "1OeLWJ1swnMmdU-N_46d3BcQMULPHS7Pl",
//         "examination_folder_id": "1bzaYXMljc7e5r6FHaUOLhTG3l6vUkRst",
//         "folder": "v2-i16-rt-LTR",
//         "template": "v2-i16-rt-LTR-%"
//     },
//     {
//         "stVersion": 2,
//         "record_folder_id": "1gBjKANaA1xfj-9pHPTkBI4Yx2nqokLOE",
//         "examination_folder_id": "1Q6FBQJOZKhmmQx8TWSma_BizXJAikN1j",
//         "folder": "v2-i16-rt-OtO",
//         "template": "v2-i16-rt-OtO-%"
//     },




//     {
//         "stVersion": 2,
//         "record_folder_id": "1gc4ykKL9HIQ3gnXtGGdSbZDUG7GOgXhA",
//         "examination_folder_id": "1QKhk23UNDFXdR6K07Sbpho4E0UFDbOnZ",
//         "folder": "v2-i16-pt-WN",
//         "template": "v2-i16-pt-WN-%"
//     },

//     {
//         "stVersion": 2,
//         "record_folder_id": "18PRC7ivsBbFQ_bkG4DhJS1eEhiwAmXEJ",
//         "examination_folder_id": "14eZDcSntJCT0ojIpC9bhg_w003WV3_rp",
//         "folder": "v2-i16-pt-HP",
//         "template": "v2-i16-pt-HP-%"
//     },

//     {
//         "stVersion": 2,
//         "record_folder_id": "1QxqdYXUvqcd9h0FzQ5LHz6RFGJqmpHx8",
//         "examination_folder_id": "1HVKujoaf0Vxr38wup5wqydgKbOR8lgKI",
//         "folder": "v2-i16-pt-10P",
//         "template": "v2-i16-pt-10P-%"
//     },

//     {
//         "stVersion": 2,
//         "record_folder_id": "1ylfTu9ziYydzLw4gEtg0bMF9ehC1-FFl",
//         "examination_folder_id": "1SUwtXEvWkxzLVbe_-7R7IzGy6OTKrILu",
//         "folder": "v2-i16-pt-NE",
//         "template": "v2-i16-pt-NE-%"
//     },

//     {
//         "stVersion": 2,
//         "record_folder_id": "1AjRIFofPXzeVzI37OUf6PTCy5xtFm1yg",
//         "examination_folder_id": "1jQxLTeK_gEPBIqfXIb2iu2yzb17uokHR",
//         "folder": "v2-i16-pt-5Us-NE",
//         "template": "v2-i16-pt-5Us-%"
//     },





// ]

const syncRecords = async () => {

    console.log("Sync records", DATASETS.map(d => d.folder))

    for (let dataset of DATASETS) {
        console.log(dataset.folder)
        let response = await axios.post(
            SYNC_URL, {
                query: [dataset]
            }
        )

        console.log(response.data)

    }

}


const run = async () => {

    await syncRecords()


}




run()