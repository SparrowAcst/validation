const { last } = require("lodash")

module.exports = [

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    {
        name: "9.1. Model to Model Reproducibility test",
        metadata: "Reproducibility tests/9.1. Model to Model Reproducibility test/v2-i16-rt-MtM.json",
        sync: {
            "stVersion": 2,
            "record_folder_id": "1t00v1xVfVmqxc0YpKKdcDfLEshAO1_7s",
            "examination_folder_id": "1BUJ0UL-NSPIC2oSUgrf2XqJlnFVKpCwd",
            "folder": "v2-i16-rt-MtM",
            "template": "v2-i16-rt-MtM-%"
        },
        localMetadata: "./json/v2-i16-rt-MtM.json",
        spectra: "../../../validation-data/v2i16/json/v2i16-m2m.json",
        
        fromMeta:{
            device: d => d.patient_id.split("-")[4],
            type: d => d.record_type,
            os: d => (/15/.test(d.patient_id.split("-")[4])) ? "17.1" : "18.0",
            release: d => (/15/.test(d.patient_id.split("-")[4])) ? "2023" : "2024", 
        },

        fromSpectra:{
            device: d => {
                let a = d.file.split("/")
                return a[a.length-4]
            },
            type: d => {
                let a = d.file.split("/")
                return a[a.length-3]
            },       
        }  
    },

    {
        name: "9.1. Model to Model Reproducibility test",
        metadata: "Reproducibility tests/9.1. Model to Model Reproducibility test/predicate/Eko Core/lung/",
    },

    {
        name: "9.1. Model to Model Reproducibility test",
        metadata: "Reproducibility tests/9.1. Model to Model Reproducibility test/predicate/Eko Core/heart/",
    },


///////////////////////////////////////////////////////////////////////////////////////////////////////////////


    {
        name: "9.2. Within Device Long Term Reproducibility Test",
        metadata: "Reproducibility tests/9.2. Within Device Long Term Reproducibility Test/v2-i16-rt-LTR.json",
        sync: {
            "stVersion": 2,
            "record_folder_id": "1OeLWJ1swnMmdU-N_46d3BcQMULPHS7Pl",
            "examination_folder_id": "1bzaYXMljc7e5r6FHaUOLhTG3l6vUkRst",
            "folder": "v2-i16-rt-LTR",
            "template": "v2-i16-rt-LTR-%"
        },
        localMetadata: "./json/v2-i16-rt-LTR.json",
        spectra: "../../../validation-data/v2i16/json/v2i16-ltr.json",
        fromMeta:{
            device: d => d.patient_id.split("-")[4],
            day: d => Number.parseInt(d.patient_id.split("-")[5].substring(1)),
            os: d => (/15/.test(d.patient_id.split("-")[4])) ? "17.1" : "18.0",
            release: d => (/15/.test(d.patient_id.split("-")[4])) ? "2023" : "2024",
        },
        fromSpectra:{
            device: d => {
                let a = d.file.split("/")
                return a[a.length-4]
            },
            day: d => {
                let a = d.file.split("/")
                return Number.parseInt(last(a[a.length-3].split(" ")))
            },       
        }
    },

    {
        name: "9.2. Within Device Long Term Reproducibility Test",
        metadata: "Reproducibility tests/9.2. Within Device Long Term Reproducibility Test/predicate/Eko Core/day 01/",
    },
    {
        name: "9.2. Within Device Long Term Reproducibility Test",
        metadata: "Reproducibility tests/9.2. Within Device Long Term Reproducibility Test/predicate/Eko Core/day 02/",
    },
    {
        name: "9.2. Within Device Long Term Reproducibility Test",
        metadata: "Reproducibility tests/9.2. Within Device Long Term Reproducibility Test/predicate/Eko Core/day 03/",
    },
    {
        name: "9.2. Within Device Long Term Reproducibility Test",
        metadata: "Reproducibility tests/9.2. Within Device Long Term Reproducibility Test/predicate/Eko Core/day 04/",
    },
    {
        name: "9.2. Within Device Long Term Reproducibility Test",
        metadata: "Reproducibility tests/9.2. Within Device Long Term Reproducibility Test/predicate/Eko Core/day 05/",
    },


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////






    {
        name: "9.3. Operator to Operator Reproducibility Test",
        metadata: "Reproducibility tests/9.3. Operator to Operator Reproducibility Test/v2-i16-rt-OtO.json",
        sync: {
            "stVersion": 2,
            "record_folder_id": "1gBjKANaA1xfj-9pHPTkBI4Yx2nqokLOE",
            "examination_folder_id": "1Q6FBQJOZKhmmQx8TWSma_BizXJAikN1j",
            "folder": "v2-i16-rt-OtO",
            "template": "v2-i16-rt-OtO-%"
        },
        localMetadata: "./json/v2-i16-rt-OtO.json",
        fromMeta:{
            device: d => d.patient_id.split("-")[4],
            operator: d => Number.parseInt(d.patient_id.split("-")[5].substring(1)),
            os: d => (/15/.test(d.patient_id.split("-")[4])) ? "17.1" : "18.0",
            release: d => (/15/.test(d.patient_id.split("-")[4])) ? "2023" : "2024",
        }
    },
//////////////////////////////////////////////////////////////////////////////////////////////////////

    {
        name: "10.8.2. White noise test",
        metadata: "Performance tests/10.8.2. White noise test/v2-i16-pt-WN.json",
        sync: {
            "stVersion": 2,
            "record_folder_id": "1gc4ykKL9HIQ3gnXtGGdSbZDUG7GOgXhA",
            "examination_folder_id": "1QKhk23UNDFXdR6K07Sbpho4E0UFDbOnZ",
            "folder": "v2-i16-pt-WN",
            "template": "v2-i16-pt-WN-%"
        },
        localMetadata: "./json/v2-i16-pt-WN.json",
        spectra: "../../../validation-data/v2i16/json/v2i16-wn.json",
        
        fromMeta:{
            device: d => d.patient_id.split("-")[4],
            os: d => (/15/.test(d.patient_id.split("-")[4])) ? "17.1" : "18.0",
            release: d => (/15/.test(d.patient_id.split("-")[4])) ? "2023" : "2024",
        },
        fromSpectra:{
            device: d => {
                let a = d.file.split("/")
                return a[a.length-3]
            }       
        }
    },


    {
        name: "10.8.2. White noise test",
        metadata: "Performance tests/10.8.2. White noise test/predicate/Eko Core/",
    },

    {
        name: "10.8.2. White noise test",
        metadata: "Performance tests/10.8.2. White noise test/primary signal/",
    },

    {
        name: "10.8.2. White noise test",
        metadata: "Performance tests/10.8.2. White noise test/nti microphone/",
    },




//////////////////////////////////////////////////////////////////////////////////////////////////////

    {
        name: "10.8.3. Recordings of the chest sound of a healthy participant",
        metadata: "Performance tests/10.8.3. Recordings of the chest sound of a healthy participant/v2-i16-pt-HP.json",
        sync: {
            "stVersion": 2,
            "record_folder_id": "18PRC7ivsBbFQ_bkG4DhJS1eEhiwAmXEJ",
            "examination_folder_id": "14eZDcSntJCT0ojIpC9bhg_w003WV3_rp",
            "folder": "v2-i16-pt-HP",
            "template": "v2-i16-pt-HP-%"
        },
        localMetadata: "./json/v2-i16-pt-HP.json",
        fromMeta:{
            device: d => d.patient_id.split("-")[4],
            os: d => (/15/.test(d.patient_id.split("-")[4])) ? "17.1" : "18.0",
            release: d => (/15/.test(d.patient_id.split("-")[4])) ? "2023" : "2024",
        }
  
    },
    {
        name: "10.8.4. Recordings of Heart and Lung Sounds of Ten Participants",
        metadata: "Performance tests/10.8.4. Recordings of Heart and Lung Sounds of Ten Participants/v2-i16-pt-10P.json",
        sync: {
            "stVersion": 2,
            "record_folder_id": "1QxqdYXUvqcd9h0FzQ5LHz6RFGJqmpHx8",
            "examination_folder_id": "1HVKujoaf0Vxr38wup5wqydgKbOR8lgKI",
            "folder": "v2-i16-pt-10P",
            "template": "v2-i16-pt-10P-%"
        },
        localMetadata: "./json/v2-i16-pt-10P.json",
        fromMeta:{
            device: d => d.patient_id.split("-")[4],
            participant: d => Number.parseInt(d.patient_id.split("-")[5].substring(1)),
            os: d => (/15/.test(d.patient_id.split("-")[4])) ? "17.1" : "18.0",
            release: d => (/15/.test(d.patient_id.split("-")[4])) ? "2023" : "2024",
        }
    },
    {
        name: "10.8.5. Auscultation and Recordings of the Heart and Lung Sounds of a Healthy Participant in a Noisy Environment",
        metadata: "Performance tests/10.8.5. Auscultation and Recordings of the Heart and Lung Sounds of a Healthy Participant in a Noisy Environment/v2-i16-pt-NE.json",
        sync: {
            "stVersion": 2,
            "record_folder_id": "1ylfTu9ziYydzLw4gEtg0bMF9ehC1-FFl",
            "examination_folder_id": "1SUwtXEvWkxzLVbe_-7R7IzGy6OTKrILu",
            "folder": "v2-i16-pt-NE",
            "template": "v2-i16-pt-NE-%"
        },
        localMetadata: "./json/v2-i16-pt-NE.json",
        fromMeta:{
            device: d => d.patient_id.split("-")[4],
            state: d => d.patient_id.split("-")[5].substring(1),
            os: d => (/15/.test(d.patient_id.split("-")[4])) ? "17.1" : "18.0",
            release: d => (/15/.test(d.patient_id.split("-")[4])) ? "2023" : "2024",
        }
    },
    {
        name: "10.8.6. Self-recordings of heart and lung sounds of five lay users",
        metadata: "Performance tests/10.8.6. Self-recordings of heart and lung sounds of five lay users/v2-i16-pt-5Us.json",
        sync: {
            "stVersion": 2,
            "record_folder_id": "1AjRIFofPXzeVzI37OUf6PTCy5xtFm1yg",
            "examination_folder_id": "1jQxLTeK_gEPBIqfXIb2iu2yzb17uokHR",
            "folder": "v2-i16-pt-5Us",
            "template": "v2-i16-pt-5Us-%"
        },
        localMetadata: "./json/v2-i16-pt-5Us-NE.json",
        fromMeta:{
            device: d => d.patient_id.split("-")[4],
            user: d => Number.parseInt(d.patient_id.split("-")[5].substring(1)),
            os: d => (/15/.test(d.patient_id.split("-")[4])) ? "17.1" : "18.0",
            release: d => (/15/.test(d.patient_id.split("-")[4])) ? "2023" : "2024",
        }
    },

]