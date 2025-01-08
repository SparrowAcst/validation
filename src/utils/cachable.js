const NodeCache = require("node-cache")
const EventEmitter = require("events")
const { isFunction } = require("lodash")

// let requestCache = new Cachable({
    
//     onRead: async data => {
//         // lazy load
//         const result = await docdb.aggregate({
//             db,
//             collection,
//             pipeline
//         })
//         result = result[0]
//         return result    
//     },

//     onWrite: async data => {
//         // write throuh
//         await docdb.replaceOne({
//             db,
//             collection,
//             filter: {
//                 id: data.id
//             },
//             data
//         })
//     }

//     onWrite: async data => {
//         // write back
//         publisher.send({
//             db,
//             collection,
//             filter: {
//                 id: data.id
//             },
//             data
//         })
//     }

// })



const Cachable = class extends EventEmitter {
    
    #cache
    #options
    
    constructor(options){
        
        super()

        this.#cache = new NodeCache()
        this.#options = options || {}
    
    }

    async get(key){
        
        if(!this.#cache.has(key) && this.#options.onRead && isFunction(this.#options.onRead)) {
            const value = await this.#options.onRead(key)
            if(value){
                this.#cache.set(key, value)
            }    
        }
        
        let value = (this.#cache.has(key)) ? this.#cache.get(key) : undefined
        
        this.emit("get", {key, value})
        
        return value
    }

    async set(key, value){
        
        this.#cache.set(key, value)
        
        if( this.#options.onWrite && isFunction(this.#options.onWrite)){
            await this.#options.onWrite(key, value)
        }
        
        this.emit("set", {key, value})
    }

    keys(){
      
      return this.#cache.keys()  
    
    } 
    
    getStats(){
      
      return this.#cache.getStats()
    
    }

    selectKeys(selector){
        selector = selector || (() => true)
        return this.keys().filter(selector)
    }

    selectData(selector){
        selector = selector || (() => true)
        return this.keys().map(key => this.#cache.get(key)).filter(selector)
    }

}

const run = async () => {
    
    const simpleCachedData = new Cachable()
    
    simpleCachedData.on("set", d => {
        console.log("set", d)
    })

    simpleCachedData.on("get", d => {
        console.log("get", d)
    })

    for(let i=0; i<5; i++){
        await simpleCachedData.set(i,i)    
    }

    console.log(simpleCachedData.selectData(d => d >= 3))    
    console.log(simpleCachedData.selectKeys( k => k<2))    
    
    for(let i=0; i<5; i++){
        let res = await simpleCachedData.get(Math.round(Math.random()*10))
        console.log(res)    
    }
    
}

run()