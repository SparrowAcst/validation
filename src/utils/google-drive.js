

const mem = (msg) => {
		const used = process.memoryUsage();
		console.log(`${msg} :Memory usage: ${Math.round(used.rss / 1024 / 1024 * 100) / 100} MB`);
		return used.rss
	}	
	



const { google } = require("googleapis")
const path = require("path")
const { getMIMEType } = require('node-mime-types')
const fs = require("fs")
const { find, findIndex, isUndefined, extend, last, uniqBy, maxBy, chunk, isFunction, isString } = require("lodash")
const nanomatch = require('nanomatch')
const YAML = require("js-yaml")
const { makeDir, getFileList } = require("./file-system")

const key = require(path.join(__dirname,"../../.config/key/gd/gd.key.json"))





let logger


const getPath = (files, node) => {
	let res = []
	for( let n = node; ; ){
		res.push(n.name)
		if(isUndefined(n.parents)) break
		n = find(files, f => n.parents.includes(f.id))
		if(!n) break	
	}	
	res.reverse()

	return res.join("/")	
}

const getList = files => {
	
	const raws = files.map( f => extend(f, { path: getPath(files,f) }))
	const pathes = uniqBy(raws, "path").map( d => d.path)
	let res = []
	pathes.forEach( p => {
		res.push( maxBy(raws.filter(r => r.path == p), "modifiedTime"))
	})
	return res
}	


async function loadList({ drive, options}){
	try {
		
		// console.log(options)

	  	let res = []
	  	let nextPageToken
	  	do {
	
	  		const part = await drive.files.list(
	  			extend( 
	  				{}, 
	  				{
			  		  pageSize: 500,
				      pageToken: nextPageToken || "",	
				      fields: "files(id, webViewLink, name, mimeType, md5Checksum, createdTime, modifiedTime, parents, size, trashed, version, owners ), nextPageToken",
				      spaces: 'drive'
				    },
				    options
				)
			)		
		    res = res.concat(part.data.files)
		    process.stdout.write(`...load  ${res.length} items                                     ${'\x1b[0G'}`)
		    nextPageToken = part.data.nextPageToken
	
	  	} while (nextPageToken)

	  	return res
  	
  	} catch (e) {
  		console.log(e.toString())
    	throw e;
  	}
}


async function getFolder ({ path = "", drive, fromRoot, owner } ) {
	
	if(!path) return {cache: [], endPoints: []}

	ownerConstraint = (owner) ? `and '${owner}' in owners `: "" 

	let pathes = path.split("/").filter( p => p)
	let name = pathes.shift() 
	let prevs = await loadList({drive, options:{q:` name = '${name}' ${ownerConstraint} and mimeType = 'application/vnd.google-apps.folder' and trashed = false`}})
	
	if(fromRoot == false) {
		prevs = prevs.filter( d => !d.parents)
	}	
	

	let temp = []
	
	while (pathes.length > 0) {

		temp = temp.concat(prevs.map(d => d))
		name = pathes.shift()
		let nextWave = []
		let part = await loadHelper({drive, points: prevs, selector: `name='${name}' and `})
		nextWave = nextWave.concat(part)	
		prevs = nextWave.map(d => d)
		
	}	
	
	return {
	
		cache: temp,
		endPoints: prevs

	}		

}


async function createPath({ drive, pathes }){
	let buf = []
	let parent 
	while (pathes.length > 0){
		let current = pathes.shift()
		let created = false
		if( !current.instance ) {
			created = true
			current.instance = (await drive.files.create({
			  resource: {
			    name: current.name,
			    mimeType: 'application/vnd.google-apps.folder',
			    parents: (parent) ? [ parent ] : undefined,
			  },
			  fields: "id, name, mimeType, md5Checksum, createdTime, modifiedTime, parents, size",
			})).data

		}
		parent = current.instance.id
		buf.push(current)
		process.stdout.write(`Create folder: "${buf.map(d => d.name).join("/")}"${(created) ? "(created)" : "(already exists)"}                                      ${'\x1b[0G'}`)
	}
	console.log()
	return buf 

}



async function loadHelper({drive, points, selector}){
	let buf = []
	selector = selector || ""
	let parts = chunk(points, 100)
	for(let i=0; i < parts.length; i++){
		constraints = parts[i].map( f => `${selector} '${f.id}' in parents and trashed = false `).join(" or ")
		let part = await loadList({drive, options:{q: constraints }})
		buf = buf.concat(part)
	}
	return buf
}


async function getTree ({ folder, drive}) {
	
	if(!folder || !folder.endPoints || folder.endPoints.length == 0) return []

	let temp = folder.cache.map(d => d)
	let prevs = []
	
	let constraints = folder.endPoints.map( f => ` '${f.id}' in parents and trashed = false `).join(" or ")
	let currents = await loadList({drive, options:{q:constraints}})
	
	for( let prevs =  currents.map(d => d); prevs.length > 0;  ) {
		
		temp = temp.concat(prevs)

		let nextWave = []
		let part = await loadHelper({drive, points: prevs})
		nextWave = nextWave.concat(part)	
		
		prevs = nextWave.map(d => d)
		
	}	
	
	return temp.concat(folder.endPoints)

}



const Drive = class {
	
	constructor (drive, filelist, subject, owner) {
		this.$filelist = filelist || []
		this.$drive = drive
		this.$subject = subject
		this.$fromRoot = !isUndefined(subject)
		this.$owner = owner
	}



	async downloadFiles( options ){

		options = options || {}
		
		let sourceFiles = options.googleDrive || this.fileList()
		let target = options.fs || "./"

		await makeDir(target)

		await Promise.all( sourceFiles.map( source => {
			return new Promise( async (resolve, reject) => {

				const fileId =  source.id //"1ysrg3sTWJwPVV7bl3kk8po4LBMI6KqEmVWI37pWWooM"
			
				this.$drive.files.get({ fileId, fields: "*" }, async (err, { data }) => {
				  if (err) {
				    reject(err);
				    return;
				  }
				  let filename = data.name;
				  const mimeType = data.mimeType;
				  let res;
				  if (mimeType.includes("application/vnd.google-apps")) {
				    const convertMimeTypes = {
				      "application/vnd.google-apps.document": {
				        type:
				          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
				        ext: ".docx",
				      },
				      "application/vnd.google-apps.spreadsheet": {
				        type:
				          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				        ext: ".xlsx",
				      },
				      "application/vnd.google-apps.presentation": {
				        type:
				          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
				        ext: ".pptx",
				      },
				    };
				    
				    filename += convertMimeTypes[mimeType].ext;
				    filename = path.join(path.resolve(target), filename)
				    
				    res = await this.$drive.files.export(
				      {
				        fileId,
				        mimeType: convertMimeTypes[mimeType].type,
				      },
				      { responseType: "stream" }
				    );
				  } else {
				    res = await this.$drive.files.get(
				      {
				        fileId,
				        alt: "media",
				      },
				      { responseType: "stream" }
				    );
				  }
				  const dest = fs.createWriteStream(filename);

				  res.data
				    .on("end", () => {
				    	console.log(`DOWNLOAD: ${filename}`)
				    	resolve()
				    	return
				    })
				    .on("error", (err) => {
				      reject(err)
				      console.log(err);
				      return 
				    })
				    .pipe(dest);
				});

			})
		}))	

	}


	getFolder(path, owner){
		return getFolder({
			drive: this.$drive,
			path,
			fromRoot: this.$fromRoot,
			owner: owner || this.$owner
		})
	}

	async createFolder(path){

		let pathes = path.split("/").filter( d => d )
		let resolved = pathes.map((p, index) => ({
			name: p,
			instance: this.dirList(pathes.slice(0, index+1).join("/"))[0]
		}))

		resolved = await createPath({
			drive: this.$drive,
			pathes: resolved
		})

		return last(resolved).instance
	}

	async load(path, owner) {

		console.log(`Google Drive Service (${this.$subject}) load tree "${path}" belonging to ${owner || this.$owner || this.$subject}`)

		let f 
		
		try {
	
			f = await this.getFolder(path, owner || this.$owner)
		
		} catch(e){
			console.log(e.toString())
		}	
		
		if(!f) return []
			
		let files  = await getTree({
			drive: this.$drive,
			folder: f
		})
		
		this.$filelist = getList(files)
	}

	async loadList(pattern){
		this.$fileList = await getDirList(this.$drive, pattern)
	}

	dirList(path){
		path = path || "**/*"
		if(isString(path)){
			const names = nanomatch(this.$filelist.map(f => f.path), path)
			return this.$filelist.filter(f => names.includes(f.path) && f.mimeType == "application/vnd.google-apps.folder")
		} else {
			return this.$filelist
				.filter(f => f.mimeType == "application/vnd.google-apps.folder")
				.filter(f => path(f))
		}
	}

	fileList(path){
		path = path || "**/*.*"
		if(isString(path)){
			const names = nanomatch(this.$filelist.map(f => f.path), path)
			return this.$filelist.filter(f => names.includes(f.path) && f.mimeType != "application/vnd.google-apps.folder")
		} else {
			return this.$filelist
				.filter(f => f.mimeType != "application/vnd.google-apps.folder")
				.filter(f => path(f))	
		}
	}

	list(path){
		path = path || "**/*.*"
		if(isString(path)){
			const names = nanomatch(this.$filelist.map(f => f.path), path)
			return this.$filelist.filter(f => names.includes(f.path))
		} else {
			return this.$filelist
				.filter(f => path(f))	
		}	
	}

	itemList(){
		return this.$filelist
	}

	async downloadFile(file, destPath){

		return new Promise( async (resolve, reject) => {

			console.log(`Download ${file.path} into ${destPath}/${file.name}}`)
			let inputStream = await this.geFiletWriteStream(file)
			let destStream = fs.createWriteStream(`${destPath}/${file.name}`)
			
			inputStream.on("data", chunk => {
				process.stdout.write(`DOWNLOAD: ${chunk.length} bytes                                      ${'\x1b[0G'}`)
			})
			
			inputStream.on("error", chunk => {
				console.log(e.toString())
				reject(error)
			})
			
			inputStream.on("end", chunk => {
				console.log(`${destPath}/${file.name} downloaded`)
				destStream.end()
				resolve(`${destPath}/${file.name}`)
			})	

			inputStream.pipe(destStream)

		})

	}

	doublicateList(path){
		let filelist = this.fileList(path)
		let res = []
		for(let i = 0; i < filelist.length; i++){
			for( let j = i+1; j < filelist.length; j++){
				if( filelist[i].md5Checksum === filelist[j].md5Checksum) {
					if(filelist[i].name != filelist[j].name){
						res.push([filelist[i], filelist[j]])
					}
				}
			}
		}
		return res
	}



	async geFiletWriteStream(file){
		let res = await this.$drive.files.get(
		    { fileId: file.id, alt: 'media' },
		    { responseType: 'stream' }
		)
		
		return res.data
	}

	async getFile(file){
		let res = await this.$drive.files.get(
		    { fileId: file.id, alt: 'media' },
		    { responseType: 'stream' }
		)
		
		return res
	}

	async createFolderbyPath(rootFolder, path){
		
		let rootes = rootFolder.split("/")
		rootes = rootes.map((part, index) => rootes.slice(0,index+1))
		let partitions = (path) ? path.split("/") : []
		partitions = partitions.map((part, index) => rootFolder.split("/").concat(partitions.slice(0,index+1)))
		partitions = rootes.concat(partitions)

		let current
		
		for(let i=0; i < partitions.length; i++){

			let part = partitions[i]
			
			current = this.list(part.join("/"))[0]

			if(!current){
				
				let parent = (part.slice(0,-1).join("/")) ? this.list(part.slice(0,-1).join("/"))[0] : null

				current = await this.$drive.files.create({
				  resource: {
				    name: last(part),
				    mimeType: 'application/vnd.google-apps.folder',
				    parents: (parent) ? [ parent.id ] : undefined,
				  },
				  fields: "id",
				})

				current = extend({}, current.data, {
					name: last(part),
					mimeType: 'application/vnd.google-apps.folder',
				    parents: (parent) ? [ parent.id ] : undefined,
				})

				current.path = getPath(this.$filelist, current)
				this.$filelist.push(current)

			}
		}
		return current
	}


	async uploadFiles(options) {
		let sourceFiles = options.fs || ""
		sourceFiles = await getFileList(sourceFiles)
		let target = options.googleDrive || ""
		console.log(sourceFiles)

		for(let i = 0; i< sourceFiles.length; i++){
			let sourcePath = sourceFiles[i]
			console.log(`UPLOAD: ${sourcePath} to ${target}`)
			await this.uploadFile(sourcePath, target, options.callback, true)
		}
	}

	async uploadFile(sourcePath, targetPath, callback, force){
		
		force = force || false 

		let size = 0
		let oldSize = 0
		let byteSize = 0

		let destFolder = await this.createFolderbyPath(targetPath, '')
		
		const resource = {
		    name: path.basename(sourcePath),
		    // parents: [destFolder.id]
		}


		let stat = fs.statSync(sourcePath)
		let totalSize = stat.size

		const body = fs.createReadStream(sourcePath)
		
		// console.log("UPLOAD", callback)
		
		body.on("data", chunk => {

			byteSize += chunk.length
			if (callback) callback({ upload: byteSize, total: totalSize, state: "data"})

				
			size += chunk.length / 1024 / 1024 
			if( (size - oldSize) > 0.2 ){
				process.stdout.write(`Received: ${size.toFixed(1)} Mb ${'\x1b[0G'}`)
				// console.log(`\rReceived ${size} bytes`)
				oldSize = size
				// if (callback) callback({ upload: chunk.length, total: totalSize})	
			}
		})		

		body.on("end", () => {
			if (callback) callback({state: "end"})
		})

		body.on("error", e => {
			if (callback) callback({state: "error", error: e.toString()})
		})

		const media = {
		  	mimeType: getMIMEType(path.basename(sourcePath)),
			body 
		}

		let cloned
		
		const existed = this.list(`${destFolder.path}/${path.basename(sourcePath)}`)[0]
		
		// console.log("EXISTS", existed)

		if(existed && !force){
			// console.log("UPDATE", `${destFolder.path}/${path.basename(sourcePath)}`, destFolder)
			cloned =  await this.$drive.files.update({
				fileId: existed.id,
				resource,
				media,
				fields: "id",
			})

		} else {
			// console.log("CREATE", `${destFolder.path}/${path.basename(sourcePath)}`, destFolder)
			resource.parents = [destFolder.id]
			cloned =  await this.$drive.files.create({
				  resource,
				  media,
				  fields: "id",
			})

		}		
		
		cloned  = await this.$drive.files.get({ 
			fileId: cloned.data.id, 
			fields: 'id, name, webViewLink, mimeType, md5Checksum, createdTime, modifiedTime, parents, size' 
		})

		cloned = cloned.data
		cloned.path = getPath(this.$filelist, cloned)
		this.$filelist.push(cloned)

	}


	upload(source) {
		
		return new Promise( async (resolve, reject) => {
		
			
			let rawSize = 0
			let size = 0
			let oldSize = 0
			
			let cloned = await this.getFile(source)
			
			// cloned.data.on("data", chunk => {
			// 	rawSize += chunk.length
			// 	size += chunk.length / 1024 / 1024 
			// 	if( (size - oldSize) > 0.2 ){
			// 		// process.stdout.write(`Upload: ${rawSize} bytes                                                 ${'\x1b[0G'}`)
			// 		oldSize = size	
			// 	}
			// })


			cloned.data.on("error", error => {
				console.log(error.toString())
				reject(error)
			})

			// cloned.data.on("end", () => {
			// 	console.log(`UPLOAD ${rawSize} from ${source.size} bytes                                                      `)
			// })

			resolve(cloned.data)
		}

	)}

	async copyFile(source, targetDrive, targetPath){
		mem(1)
		let destFolder = await targetDrive.createFolderbyPath(targetPath, path.dirname(source.path))
		console.log("destFolder",destFolder.path)
		console.log("from", path.dirname(source.path))

		const existed = targetDrive.list(`${destFolder.path}/${path.basename(source.path)}`)[0]
		
		if( existed && source.size == existed.size){
			console.log(`${destFolder.path}/${path.basename(source.path)} already exists.`)
			return {}
		}

		if(existed){
			console.log(`${destFolder.path}/${path.basename(source.path)} already exists but expected size ${existed.size} not equal ${source.size}`)
				
		}
		mem(2)
		let cloned
		let clonedData = await this.upload(source)

		const resource = {
		    name: source.name,
		}
		mem(3)
		const media = {
		  	mimeType: source.mimeType,
			body: clonedData,
		}

		
		try {
		
			if(existed){
		
				console.log(`Delete previus: ${destFolder.path}/${path.basename(source.path)}`)
				cloned =  await targetDrive.delete(existed)
		
			}
		
		} catch (e){
			
			console.log(e.toString())
		
		}
mem(4)
		console.log (`Create: ${destFolder.path}/${path.basename(source.path)}`)
		resource.parents = [destFolder.id]
		
		cloned =  await targetDrive.$drive.files.create({
			  resource,
			  media,
			  fields: "id",
			},
	    	{
		      onUploadProgress: evt => {
		      	process.stdout.write(`UPLOAD: ${evt.bytesRead} from ${source.size} (${(100*evt.bytesRead/source.size).toFixed(2)}%) ${'\x1b[0G'}`)
		    }
	    })
		

		console.log(`Status: ${cloned.status} ${cloned.statusText}                                                             `)
mem(5)
		cloned  = await targetDrive.$drive.files.get({ 
			fileId: cloned.data.id, 
			fields: 'id, name, mimeType, md5Checksum, createdTime, modifiedTime, parents, size' 
		})

		cloned = cloned.data
		cloned.path = getPath(targetDrive.$filelist, cloned)
		targetDrive.$filelist.push(cloned)
		
		if(cloned.size == source.size && cloned.md5Checksum == source.md5Checksum){
		} else {
			console.log(`File size "${cloned.path}" failed: ${source.size} bytes expected but ${cloned.size} bytes saved`)
			console.log(`For file recovery use command: npm run recovery "${source.path}"`)
		}
mem(6)

	}

	async delete(file){
		let res = await this.$drive.files.delete({
			fileId: file.id
		})
		return res
	}


	async copy(sourcePath, targetDrive, targetPath){

		let cloned = this.fileList(sourcePath)

	
		for(let i=0; i < cloned.length; i++){
				console.log(`Copy ${cloned[i].path} into ${targetPath}`)
				
				try {
					
					await this.copyFile(cloned[i], targetDrive, targetPath)
				
				} catch (e) {
					console.log(`${e.toString()}`)
				}
		}
		
	}	

}


const create = async root => {
	
	root = root || ""

	const jwtClient = new google.auth.JWT(
	  key.client_email,
	  null,
	  key.private_key,
	  ["https://www.googleapis.com/auth/drive"],
	  key.subject
	);

	const drive = google.drive({version: 'v3', auth: jwtClient});

	console.log(`Use Google Drive client account: ${key.client_email} (project:${key.project_id}) impersonated as ${key.subject || "default"}`)
	
	let result = new Drive(drive, [], key.subject, key.owner)
	await result.load(root) 
	return result

}


module.exports = {
	create
}	

