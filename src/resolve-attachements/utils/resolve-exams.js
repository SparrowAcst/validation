const mongodb = require("../../utils/mongodb")
const uuid = require("uuid").v4
const isValidUUID = require("uuid").validate
const { keys, isString, find } = require("lodash")

const isUUID = data => isString(data) && isValidUUID(data)

const db = require("../../../.config-migrate-db").mongodb.ade


const ENCODING = {
    sites: "ADE-SETTINGS.sites",
    orgs: "sparrow.H2-ORGANIZATION",
    users: "ADE-SETTINGS.site-users",
    actors: "sparrow.H2-ACTOR"
}


const initEncoding = async () => {
    const properties = keys(ENCODING)
    for (const prop of properties) {
        ENCODING[prop] = await mongodb.aggregate({
            db,
            collection: ENCODING[prop],
            pipeline: [{ $project: { _id: 0 } }]
        })
        console.log(`LOAD ENCODING: ${prop} : ${ENCODING[prop].length} items`)

    }
}


const execute = async collection => {

    console.log(`RESOLVE Examinations FOR ${collection}`)

    await initEncoding()

    const PAGE_SIZE = 1000
    let skip = 0
    let bufferCount = 0

    do {

        const pipeline = [{
                '$match': {
                    uuid: {
                        $exists: false
                    }
                }
            },
            {
                '$limit': PAGE_SIZE
            },
            {
                $project: {
                    _id: 0
                }
            }
        ]

        console.log(db, collection, pipeline)
        
        buffer = await mongodb.aggregate({ db, collection, pipeline })

        if (buffer.length > 0) {

            console.log(`${collection} > Read buffer ${bufferCount} started at ${skip+1} item: ${buffer.length} items`)

            if (buffer.length > 0) {

                let commands = buffer.map(d => {

                    let user, site 
                    
                    const actor = find(ENCODING.actors, e => e.id == d.actorId)
                    
                    if(actor){
                        user = find(ENCODING.users, e => e.email.includes(actor.email))
                    } else {
                        console.log(`${d.patientId} ignore: actor ${d.actorId} not found`)
                        return 
                    }

                    if(!user){
                        console.log(`${d.patientId} ignore: user ${actor.email} not found`)
                        return   
                    }

                    let org = find(ENCODING.orgs, e => e.id == d.organization)
                    
                    if(!org){
                        org = find(ENCODING.orgs, e => e.id == actor.organization)
                    }

                    if(org){
                        site = find(ENCODING.sites, e => e.name == org.name)
                    } else {
                        console.log(`${d.patientId} ignore: org ${d.organization} ${actor.organization} not found`)
                        return 
                    }

                    if(!site){
                        console.log(`${d.patientId} ignore: site ${org.name} not found`)
                        return   
                    }

                    const euuid = isUUID(d.id) ? d.id : uuid()

                    return {
                        updateOne: {
                            filter: { id: d.id },
                            update: {
                                $set: {
                                    uuid: euuid,
                                    userId: user.id,
                                    siteId: site.id
                                }
                            },
                            upsert: true
                        }
                    }

                })


                console.log(`${collection} > Write buffer ${bufferCount} : ${buffer.length} items`)

                
                await mongodb.bulkWrite({ db, collection, commands.filter( c => c) })

            }

        }

        skip += buffer.length
        bufferCount++

    }
    while (buffer.length > 0 && bufferCount < 2)

}


module.exports = execute