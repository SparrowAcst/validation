const glob = require("fast-glob")
const fs = require("fs")
const fse = require("fs-extra")
const path = require("path")
const YAML = require("js-yaml")
const { extend } = require("lodash")

const writeFile = fs.writeFileSync

const getFileList = async ( pattern, options ) => {
    pattern = pattern || "./"
    let result = await glob(pattern, options)
    return result.map( f => path.resolve(f))
}     

const getDirList = async (pattern, options) => {
    
	options = extend(
		{},
		{
			includeParentPath: false,
			absolitePath: false
		},

		options
	)

	pattern = ( /\/$/.test(pattern)) ? pattern : `${pattern}/`

    let filesAndDirectories = await fse.readdir(pattern);

    let directories = [];
    await Promise.all(
        filesAndDirectories.map(name =>{
            return fse.stat(pattern + name)
            .then(stat =>{
                if(stat.isDirectory()) directories.push(name)
            })
        })
    );

    if(options.includeParentPath){
    	directories = directories.map( d => pattern+d)
    	if(options.absolutePath){
    		directories = directories.map( d => path.resolve(d))
    	}
    }
    return directories;
}

const makeDir = async dir => fse.ensureDir(path.resolve(dir))

const loadConfig = filename => YAML.load(fs.readFileSync(path.resolve(process.argv[2])).toString().replace(/\t/gm, " "))

const loadJSON = filename => JSON.parse(fs.readFileSync(path.resolve(filename)).toString())
const loadYAML = filename => YAML.load(fs.readFileSync(path.resolve(filename)).toString().replace(/\t/gm, " "))


// const postFile = async ( url, file, script) => {
    
//     let formData = new FormData()
//     formData.append("app", "spectrum")
    
//     // const buffer = fs.createReadStream(file)
//     formData.append('file', script, file);

//     // const contentLength = await formData.getLength();

//     try {

//     console.log({
//         method: 'POST',
//         url,
//         headers: {
//             ...formData.getHeaders()
//         },
//         data: formData
//     })    

//     // const response = await axios({
//     //     method: 'POST',
//     //     url,
//     //     headers: {
//     //         ...formData.getHeaders()
//     //     },
//     //     data: formData
//     // })

//     const response = await axios.post(url, formData.getBuffer(), {
//         headers: {
//             ...formData.getHeaders()
//         }
//     })
    
//     console.log(response)
//     } catch (e) {
//         console.log(e.toString())
//     }

// }


module.exports = {
	getFileList,
	getDirList,
	makeDir,
	writeFile,
    loadJSON,
    loadYAML	
}

