const glob = require("fast-glob")
const fs = require("fs")
const fse = require("fs-extra")
const path = require("path")
const YAML = require("js-yaml")
const { extend, keys, isArray } = require("lodash")


const filesize = (bytes, options) => {
    
    const units = 'BKMGTPEZY'.split('')
    const equals = (a, b) => a && a.toLowerCase() === b.toLowerCase()
    
    bytes = typeof bytes == 'number' ? bytes : Number.parseInt(bytes)
    bytes = (Number.isNaN(bytes)) ? 0 : bytes
    
    options = options || {}
    options.fixed = typeof options.fixed == 'number' ? options.fixed : 2
    options.spacer = typeof options.spacer == 'string' ? options.spacer : ' '

    options.calculate = spec => {
        let type = equals(spec, 'si') ? ['k', 'B'] : ['K', 'iB']
        const algorithm = equals(spec, 'si') ? 1e3 : 1024
        const magnitude = Math.log(bytes) / Math.log(algorithm) | 0
        const result = (bytes / Math.pow(algorithm, magnitude))
        const fixed = result.toFixed(options.fixed)
        
        if (magnitude - 1 < 3 && !equals(spec, 'si') && equals(spec, 'jedec'))
            type[1] = 'B'

        let suffix = magnitude ?
            (type[0] + 'MGTPEZY')[magnitude - 1] + type[1] :
            ((fixed | 0) === 1 ? 'Byte' : 'Bytes')

        return {
            suffix: suffix,
            magnitude: magnitude,
            result: result,
            fixed: fixed,
            bits: { result: result / 8, fixed: (result / 8).toFixed(options.fixed) }
        }
    }

    options.to = (unit, spec) => {
        const algorithm = equals(spec, 'si') ? 1e3 : 1024
        const position = units.indexOf(typeof unit == 'string' ? unit[0].toUpperCase() : 'B')
        const result = bytes

        if (position === -1 || position === 0) return result.toFixed(2)
        for (; position > 0; position--) result /= algorithm
        return result.toFixed(2)
    }

    options.humanize = spec => {
        const output = options.calculate(spec)
        return output.fixed + options.spacer + output.suffix
    }

    return options;
}

const writeFile = fs.writeFileSync

const getFileList = async ( pattern, options ) => {
    pattern = pattern || "./"
    let result = await glob(pattern, options)
    return result.map( f => path.resolve(f))
}     


const unlink = async path => {
    await fs.promises.unlink(path)
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

// const loadJSON = filename => JSON.parse(fs.readFileSync(path.resolve(filename)).toString())
const loadYAML = filename => YAML.load(fs.readFileSync(path.resolve(filename)).toString().replace(/\t/gm, " "))



const loadJSON = filename => {
    let result = fs.readFileSync(path.resolve(filename)).toString()
    // console.log(result)
    
    try {
        result = JSON.parse(result)
    } catch (e) {
        console.log("LOAD JSON", e.toString())
        result = result
            .replace(/(:)(\s*)([A-Za-z\.0-9]+)/g, ": \"$3\"")
            .replace(/(\")([0-9\.]+)(\")/g, "$2")
        
        eval(`result = ${result}`)
        
    }

    return result

}

const saveJSON = (filename, data) => {
    writeFile(filename, JSON.stringify(data, null, " "))
}

const loadText = filename => {
    let result = fs.readFileSync(path.resolve(filename)).toString()
    return result
}    


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


const rmDir = require('lignator').remove


const unzip = (path2zip, path2dest, logger) => new Promise( (resolve, reject) => {
    const inly = require('inly');
    logger = logger || console
    const extract = inly(path2zip, path2dest);
    let _p = 0
    let extractedFilePath 
    extract.on('file', (name) => {
        extractedFilePath = name
        logger.info(`File ${name} extracted`)
    });

    extract.on('progress', (percent) => {
        // if( config.mode == "development"){
        //  if( (percent % 5) == 0) _p = percent
        //  logUpdate(`${frame()} ${ _p }%`)    
        // }
    });

    extract.on('error', (error) => {
        reject(error)
    });

    extract.on('end', () => {
        resolve(extractedFilePath)
    }); 
})

const remove = filelist => {
    filelist = (isArray(filelist)) ? filelist : [filelist]
    filelist.forEach( f => {
        fs.unlinkSync(f)
    })
}


module.exports = {
	getFileList,
	files: getFileList,
    getDirList,
    dirs: getDirList,
	makeDir,
    mkdir: makeDir,
    rmDir,
    rmdir: rmDir,
	writeFile,
    loadJSON,
    saveJSON,
    loadYAML,
    loadText,
    unlink,
    filesize,
    exists: fse.pathExists,
    unzip,
    rename: fs.renameSync,
    rm: remove	
}

