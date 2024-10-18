module.exports = [
    
    {
        name: "9.1. Model to Model Reproducibility test",
        metadata: "Reproducibility tests/9.1. Model to Model Reproducibility test/v3-i16-rt-MtM.json",
        sync: {
            "stVersion": 3,
            "record_folder_id": "1Y2083nlFJfw2W2OJ0SySdkbNY1C4xzMV",
            "examination_folder_id": "1xJJZbZfp-sX3ylmYyfQBxGpu17k8Yyps",
            "folder": "v3-i16-rt-MtM",
            "template": "v3-i16-rt-MtM-%"
        },
        localMetadata: "./json/v3-i16-rt-MtM.json",
        spectra: "../../../validation-data/v3i16/json/v3i16-m2m.json",
        
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
        metadata: "Reproducibility tests/9.1. Model to Model Reproducibility test/predicate/v2 iP 15/v3-i16-rt-MtM-v2-iP-15.json",
        sync: {
            "stVersion": 2,
            "record_folder_id": "1kqb7tn_A6C7pryCLISRu9XtEhWFm0Pwy",
            "examination_folder_id": "1Alc-UBA2YTRFtrUJ7fxrzBAqtxSl33W4",
            "folder": "v3-i16-rt-MtM-v2-iP-15",
            "template": "v3-i16-rt-MtM-v2 iP 15%"
        },
        localMetadata: "./json/v3-i16-rt-MtM-v2-iP-15.json",
    },



    {
        name: "9.2. Within Device Long Term Reproducibility Test",
        metadata: "Reproducibility tests/9.2. Within Device Long Term Reproducibility Test/v3-i16-rt-LTR.json",
        sync: {
            "stVersion": 3,
            "record_folder_id": "1lIAIRVQjg4AACMLG3E1ZWnuub2PSBbYK",
            "examination_folder_id": "16lzTGhVquEpy4fsQRefDwb36r4rfPbxH",
            "folder": "v3-i16-rt-LTR",
            "template": "v3-i16-rt-LTR-%"
        },
        localMetadata: "./json/v3-i16-rt-LTR.json",
        spectra: "../../../validation-data/v3i16/json/v3i16-ltr.json",
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
        metadata: "Reproducibility tests/9.2. Within Device Long Term Reproducibility Test/predicate/v2 iP 15/v3-i16-rt-LTR-v2-iP-15.json",
        sync: {
            "stVersion": 2,
            "record_folder_id": "1nl67qUHc6KZsrSNn3LSCO6q68XLquC-l",
            "examination_folder_id": "1tkI1q3Mgbn5T1NPGmUgOku3FQes25pOL",
            "folder": "v3-i16-rt-LTR-v2-iP-15",
            "template": "v3-i16-rt-LTR-v2 iP 15%"
        },
        localMetadata: "./json/v3-i16-rt-LTR-v2-iP-15.json",
        
    },

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    {
        name: "9.3. Operator to Operator Reproducibility Test",
        metadata: "Reproducibility tests/9.3. Operator to Operator Reproducibility Test/v3-i16-rt-OtO.json",
        sync: {
            "stVersion": 3,
            "record_folder_id": "1vKwp-egmGbSEW4kOIB2VaDCII8GpIREV",
            "examination_folder_id": "1WPLLGLIKndou2AQLA-CyYk1Ii6q-9f5M",
            "folder": "v3-i16-rt-OtO",
            "template": "v3-i16-rt-OtO-%"
        },
        localMetadata: "./json/v3-i16-rt-OtO.json",
        select:{
            device: d => d[4],
            operator: d => Number.parseInt(d[5].substring(1)),
            os: d => (/15/.test(d[4])) ? "17.1" : "18.0",
            release: d => (/15/.test(d[4])) ? "2023" : "2024",
        }

    },

    {
        name: "9.3. Operator to Operator Reproducibility Test",
        metadata: "Reproducibility tests/9.3. Operator to Operator Reproducibility Test/predicate/v2 iP 14/v3-i16-rt-OtO-v2-iP-14.json",
        sync: {
            "stVersion": 2,
            "record_folder_id": "1EodekS-q3DzZnFJksL8icwOpFU7e-icA",
            "examination_folder_id": "1Iym-c5PomrmVVpKD5yW8ih_ZkL4U_0pC",
            "folder": "v3-i16-rt-OtO-v2-iP-14",
            "template": "v3-i16-rt-OtO-v2 iP 14%"
        },
        localMetadata: "./json/v3-i16-rt-OtO.json",
        fromMeta:{
            device: d => d.patient_id.split("-")[4],
            operator: d => Number.parseInt(d.patient_id.split("-")[5].substring(1)),
            type: d => d.record_type,
            os: d => (/15/.test(d.patient_id.split("-")[4])) ? "17.1" : "18.0",
            release: d => (/15/.test(d.patient_id.split("-")[4])) ? "2023" : "2024",
        },
        
        spectra: "../../../validation-data/v3i16/json/v3i16-OtO.json",
        analyzer: "v2i16-spectra-OtO",
        
        // fromSpectra:{
        //     device: d => {
        //         let a = d.file.split("/")
        //         return a[a.length-5]
        //     },
        //     type: d => {
        //         let a = d.file.split("/")
        //         return a[a.length-4]
        //     },   
        //     day: d => {
        //         let a = d.file.split("/")
        //         return Number.parseInt(a[a.length-3])
        //     },       
        // }
    },

    // {
    //     name: "9.3. Operator to Operator Reproducibility Test",
    //     metadata: "Reproducibility tests/9.3. Operator to Operator Reproducibility Test/predicate/Eko Core/heart/01/",
    // },
    // {
    //     name: "9.3. Operator to Operator Reproducibility Test",
    //     metadata: "Reproducibility tests/9.3. Operator to Operator Reproducibility Test/predicate/Eko Core/heart/02/",
    // },
    // {
    //     name: "9.3. Operator to Operator Reproducibility Test",
    //     metadata: "Reproducibility tests/9.3. Operator to Operator Reproducibility Test/predicate/Eko Core/heart/03/",
    // },
    // {
    //     name: "9.3. Operator to Operator Reproducibility Test",
    //     metadata: "Reproducibility tests/9.3. Operator to Operator Reproducibility Test/predicate/Eko Core/heart/04/",
    // },
    // {
    //     name: "9.3. Operator to Operator Reproducibility Test",
    //     metadata: "Reproducibility tests/9.3. Operator to Operator Reproducibility Test/predicate/Eko Core/heart/05/",
    // },

    // {
    //     name: "9.3. Operator to Operator Reproducibility Test",
    //     metadata: "Reproducibility tests/9.3. Operator to Operator Reproducibility Test/predicate/Eko Core/lungs/01/",
    // },
    // {
    //     name: "9.3. Operator to Operator Reproducibility Test",
    //     metadata: "Reproducibility tests/9.3. Operator to Operator Reproducibility Test/predicate/Eko Core/lungs/02/",
    // },
    // {
    //     name: "9.3. Operator to Operator Reproducibility Test",
    //     metadata: "Reproducibility tests/9.3. Operator to Operator Reproducibility Test/predicate/Eko Core/lungs/03/",
    // },
    // {
    //     name: "9.3. Operator to Operator Reproducibility Test",
    //     metadata: "Reproducibility tests/9.3. Operator to Operator Reproducibility Test/predicate/Eko Core/lungs/04/",
    // },
    // {
    //     name: "9.3. Operator to Operator Reproducibility Test",
    //     metadata: "Reproducibility tests/9.3. Operator to Operator Reproducibility Test/predicate/Eko Core/lungs/05/",
    // },


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    {
        name: "10.8.2. White noise test",
        metadata: "Performance tests/10.8.2. White noise test/v3-i16-pt-WN.json",
        sync: {
            "stVersion": 3,
            "record_folder_id": "1Hrx9vG9XvLB_ezKHD6fRYmXs3v5LIErS",
            "examination_folder_id": "18B7Phpad0AsTAi-787eykZSiUSOO_2ps",
            "folder": "v3-i16-pt-WN",
            "template": "v3-i16-pt-WN-%"
        },
        localMetadata: "./json/v3-i16-pt-WN.json",
        spectra: "../../../validation-data/v3i16/json/v3i16-wn.json",
        
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
        metadata: "Performance tests/10.8.2. White noise test/primary signal/",
    },

    {
        name: "10.8.2. White noise test",
        metadata: "Performance tests/10.8.2. White noise test/nti microphone/",
    },


    {
        name: "10.8.2. White noise test",
        metadata: "Performance tests/10.8.2. White noise test/predicate/v2 iP 15/v3-i16-pt-WN-v2-iP-15.json",
        sync: {
            "stVersion": 2,
            "record_folder_id": "1DabiTmDxQ1iy_MuvN3gDNPRFt5so09l0",
            "examination_folder_id": "17EQfuZYqHovRFJQydMRQElnB7NW-GoRO",
            "folder": "v3-i16-pt-WN-v2-iP-15",
            "template": "v3-i16-pt-WN-v2 iP 15%",
        },
        

        localMetadata: "./json/v3-i16-pt-WN-v2-iP-15",
    },

    {
        name: "10.8.3. Recordings of the chest sound of a healthy participant",
        metadata: "Performance tests/10.8.3. Recordings of the chest sound of a healthy participant/v3-i16-pt-HP.json",
        sync: {
            "stVersion": 3,
            "record_folder_id": "17mYVcMEG3wpZo0bqgar8Yp0u6VeHRiAZ",
            "examination_folder_id": "1njXUy7sfiH6tI52a7Xv8IHJ-h25GD-R5",
            "folder": "v3-i16-pt-HP",
            "template": "v3-i16-pt-HP-%"
        },
        localMetadata: "./json/v3-i16-pt-HP.json",
        select:{
            device: d => d[4],
            os: d => (/15/.test(d[4])) ? "17.1" : "18.0",
            release: d => (/15/.test(d[4])) ? "2023" : "2024",
        }

    },

    {
        name: "10.8.3. Recordings of the chest sound of a healthy participant",
        metadata: "Performance tests/10.8.3. Recordings of the chest sound of a healthy participant/predicate/v2 iP 15/v3-i16-pt-HP-v2-iP-15.json",
        sync: {
            "stVersion": 2,
            "record_folder_id": "1KT32wX9Ys5T0u2yEzh172y_upWQsLWm9",
            "examination_folder_id": "1ssj26enGUePDOPYD2yqDGWE3IaY46MGq",
            "folder": "v3-i16-pt-HP-v2-iP-15",
            "template": "v3-i16-pt-HP-v2 iP 15%"
        },
        localMetadata: "./json/v3-i16-pt-HP-v2-iP-15.json",
        select:{
            device: d => d[4],
            os: d => (/15/.test(d[4])) ? "17.1" : "18.0",
            release: d => (/15/.test(d[4])) ? "2023" : "2024",
        }

    },


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    {
        name: "10.8.4. Recordings of Heart and Lung Sounds of Ten Participants",
        metadata: "Performance tests/10.8.4. Recordings of Heart and Lung Sounds of Ten Participants/v3-i16-pt-10P.json",
        sync: {
            "stVersion": 3,
            "record_folder_id": "1Jw2BfTGqUSsoQ3TqR1jZFxzP96m8RT22",
            "examination_folder_id": "1tL62fYxP5RBNAqERNRzRYbqrCXhz2svz",
            "folder": "v3-i16-pt-10P",
            "template": "v3-i16-pt-10P-%"
        },
        localMetadata: "./json/v3-i16-pt-10P.json",
        spectra: "../../../validation-data/v3i16/json/v3i16-10p.json",
        analyzer: "v3i16-spectra-10P",
        
        fromMeta:{
            device: d => d.patient_id.split("-")[4],
            type: d => d.record_type,
            participant: d => Number.parseInt(d.patient_id.split("-")[5].substring(1)),
            os: d => (/15/.test(d.patient_id.split("-")[4])) ? "17.1" : "18.0",
            release: d => (/15/.test(d.patient_id.split("-")[4])) ? "2023" : "2024",
            spot: d => (d.record_type == "heart") ? d.record_spot : "rightAnteriorLowerLung"
        },
    },

    {
        name: "10.8.4. Recordings of Heart and Lung Sounds of Ten Participants",
        metadata: "Performance tests/10.8.4. Recordings of Heart and Lung Sounds of Ten Participants/predicate/v2 iP 14/v3-i16-pt-10P-v2-iP-14.json",
        sync: {
            "stVersion": 2,
            "record_folder_id": "1mB9W1MT4d2iQN1u3EsjMFFYNKHaZ88oB",
            "examination_folder_id": "1FEv6obNaXI_tpKvvr-bsUhWtvSCJCFle",
            "folder": "v3-i16-pt-10P-v2-iP-14",
            "template": "v3-i16-pt-10P-v2 iP 14%"
        },
        localMetadata: "./json/v3-i16-pt-10P-v2-iP-14.json",
    },

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    {
        name: "10.8.5. Auscultation and Recordings of the Heart and Lung Sounds of a Healthy Participant in a Noisy Environment",
        metadata: "Performance tests/10.8.5. Auscultation and Recordings of the Heart and Lung Sounds of a Healthy Participant in a Noisy Environment/v3-i16-pt-NE.json",
        sync: {
            "stVersion": 3,
            "record_folder_id": "1p_C4WF2NmeaHZxrrNh1c5nt6heSaPPFa",
            "examination_folder_id": "1F4hf6xINqLqRzUqcK-XM-9t5andZ9WWi",
            "folder": "v3-i16-pt-NE",
            "template": "v3-i16-pt-NE-%"
        },
        localMetadata: "./json/v3-i16-pt-NE.json",
        select:{
            device: d => d[4],
            state: d => d[5].substring(1),
            os: d => (/15/.test(d[4])) ? "17.1" : "18.0",
            release: d => (/15/.test(d[4])) ? "2023" : "2024",
        }
    },
    {
        name: "10.8.6. Self-recordings of heart and lung sounds of five lay users",
        metadata: "Performance tests/10.8.6. Self-recordings of heart and lung sounds of five lay users/v3-i16-pt-5Us.json",
        sync: {
            "stVersion": 3,
            "record_folder_id": "1WvV0O8N7Jph5VHFGgKjQYznHc__3znVw",
            "examination_folder_id": "1AHxwPmI-Wd6YeYLSbWVkLVmzeOwwIWou",
            "folder": "v3-i16-pt-5Us",
            "template": "v3-i16-pt-5Us-%"
        },
        localMetadata: "./json/v3-i16-pt-5Us.json",
        select:{
            device: d => d[4],
            user: d => Number.parseInt(d[5].substring(1)),
            os: d => (/15/.test(d[4])) ? "17.1" : "18.0",
            release: d => (/15/.test(d[4])) ? "2023" : "2024",
        }

    },

///////////////////////////////////////////////////////////////////////////////////////////////////////////

    {
        name: "11.2.2. Test 2.2: Validation of the Effect of Stethophone v3 Filters on the Spectral Composition of Sound",
        metadata: "Performance tests/11.2.2 Test 2.2: Validation of the Effect of Stethophone v2 Filters on the Spectral Composition of Sound/iP 15/no filter/",
        spectra: "../../../validation-data/v3i16/json/v3i16-filter.json",
        analyzer: "v3i16-spectra-filter",
        fromMeta:{
            device: d => d.patient_id.split("-")[4],
            os: d => (/15/.test(d.patient_id.split("-")[4])) ? "17.1" : "18.0",
            release: d => (/15/.test(d.patient_id.split("-")[4])) ? "2023" : "2024",
        },
        fromSpectra:{
            device: d => {
                let a = d.file.split("/")
                return a[a.length-4]
            },
            filter: d => {
                let a = d.file.split("/")
                return a[a.length-3]
            },       
        }
    },


    {
        name: "11.2.2. Test 2.2: Validation of the Effect of Stethophone v3 Filters on the Spectral Composition of Sound",
        metadata: "Performance tests/11.2.2 Test 2.2: Validation of the Effect of Stethophone v2 Filters on the Spectral Composition of Sound/iP 15/bell/",
    },
    {
        name: "11.2.2. Test 2.2: Validation of the Effect of Stethophone v3 Filters on the Spectral Composition of Sound",
        metadata: "Performance tests/11.2.2 Test 2.2: Validation of the Effect of Stethophone v2 Filters on the Spectral Composition of Sound/iP 15/diaphragm/",
    },
    {
        name: "11.2.2. Test 2.2: Validation of the Effect of Stethophone v3 Filters on the Spectral Composition of Sound",
        metadata: "Performance tests/11.2.2 Test 2.2: Validation of the Effect of Stethophone v2 Filters on the Spectral Composition of Sound/iP 15/starling/",
    },

    {
        name: "11.2.2. Test 2.2: Validation of the Effect of Stethophone v3 Filters on the Spectral Composition of Sound",
        metadata: "Performance tests/11.2.2 Test 2.2: Validation of the Effect of Stethophone v2 Filters on the Spectral Composition of Sound/iP 16/no filter/",
    },
    {
        name: "11.2.2. Test 2.2: Validation of the Effect of Stethophone v3 Filters on the Spectral Composition of Sound",
        metadata: "Performance tests/11.2.2 Test 2.2: Validation of the Effect of Stethophone v2 Filters on the Spectral Composition of Sound/iP 16/bell/",
    },
    {
        name: "11.2.2. Test 2.2: Validation of the Effect of Stethophone v3 Filters on the Spectral Composition of Sound",
        metadata: "Performance tests/11.2.2 Test 2.2: Validation of the Effect of Stethophone v2 Filters on the Spectral Composition of Sound/iP 16/diaphragm/",
    },
    {
        name: "11.2.2. Test 2.2: Validation of the Effect of Stethophone v3 Filters on the Spectral Composition of Sound",
        metadata: "Performance tests/11.2.2 Test 2.2: Validation of the Effect of Stethophone v2 Filters on the Spectral Composition of Sound/iP 16/starling/",
    },

    {
        name: "11.2.2. Test 2.2: Validation of the Effect of Stethophone v3 Filters on the Spectral Composition of Sound",
        metadata: "Performance tests/11.2.2 Test 2.2: Validation of the Effect of Stethophone v2 Filters on the Spectral Composition of Sound/nti microphone/na/",
    },


]