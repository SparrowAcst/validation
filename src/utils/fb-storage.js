const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage, getDownloadURL } = require('firebase-admin/storage');

const Storage = class {

    constructor(serviceAccount) {
        
        const app = initializeApp({
            credential: cert(serviceAccount),
            storageBucket: `gs://${serviceAccount.project_id}.appspot.com`
        });

        this.bucket = getStorage(app).bucket();
    }


    async getSignedUrl(filename){

        const file = this.bucket.file(filename)
        let res = await file.getSignedUrl({
                action: 'read',
                expires: new Date().setFullYear(new Date().getFullYear() + 2)
            })
        return res[0]

    }

    async uploadFile(filepath, filename) {

        try {

            let res = await this.bucket.upload(filepath, {
                gzip: true,
                destination: filename,
                metadata: {
                    contentType: 'audio/x-wav'
                }
            })

            res = await res[0].getSignedUrl({
                action: 'read',
                expires: new Date().setFullYear(new Date().getFullYear() + 2)
            })

            return res

        } catch (e) {
            console.log('Retry');
            return uploadFile(filepath, filename);
        }

    }

    saveFileFromStream(filename, file, stream) {
        return new Promise((resolve, reject) => {
            stream
                .pipe(this.bucket.file(filename).createWriteStream({
                    gzip: true,
                    metadata: {
                        contentType: file.mimeType
                    }
                }))
                .on('finish', async () => {

                    let res = await this.bucket.file(filename).getSignedUrl({
                        action: 'read',
                        expires: new Date().setFullYear(new Date().getFullYear() + 2)
                    })

                    resolve(res)
                })
                .on('error', err => {
                    reject(err)
                })

        })
    }


    async saveFile(filename, data) {
        try {


            let res = await this.bucket.file(filename).save(data, {
                gzip: true,
                metadata: {
                    contentType: 'audio/x-wav'
                }
            })

            res = await this.bucket.file(filename).getSignedUrl({
                action: 'read',
                expires: new Date().setFullYear(new Date().getFullYear() + 2)
            })

            return res

        } catch (e) {
            console.log(e.toString())
            console.log('Retry');
            return saveFile(filename, data);
        }

    }


    async downloadFile(srcFilename, destFilename) {
      try {
        
        const options = {
            destination: destFilename,
        };

        return this.bucket.file(srcFilename).download(options);
      
      } catch(e) {
        console.log(e.toString())
      }  
    }
    

    async fetchFileData(srcFileName) {
      try {
          const contents = await this.bucket.file(srcFileName).download();
          return contents
      } catch (e){
        console.log(e.toString())
      }    
    }

    async getFileMetadata(filename) {
        let res = []
        try {
            res = await this.bucket.file(filename).getMetadata()
        } catch (e) {
            console.log(e.toString())
        } finally {
            return res[0]
        }

    }

        async setFileMetadata(filename, metadata) {
        let res = []
        try {
            res = await this.bucket.file(filename).setMetadata(metadata)
        } catch (e) {
            console.log(e.toString())
        } finally {
            return res[0]
        }

    }


    async getFile(filename) {
        let file
        try {
            file = await this.bucket.file(filename)
            console.log(getDownloadURL)

            // res = await getDownloadURL(file)
        } catch (e) {
            console.log(e.toString())
        } finally {
            return file
        }

    }

}



module.exports = Storage