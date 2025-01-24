const googledriveService = require("../utils/google-drive")

const SOURCE_DIR = "TRANSFER-FILES/SOURCE/ECHO/"
// const SOURCE_DIR = "TRANSFER-FILES/TEST/"


const execute = async () => {

    let drive = await googledriveService.create(SOURCE_DIR)
    let files = drive.fileList("**/*.*")
    
    let commands = files.map( f => ({
        fileId: f.id,
        oldName: f.name,
        name: f.name.replace(/Копія \"/gm, "").replace(/\"/gm, "")
    })).filter(c => /Копія \"/.test(c.oldName))
    
    // console.log(commands)

    for(const command of commands){
        console.log(command)
        await drive.rename(command)        
    }

}


execute()