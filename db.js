const mongodb = require('mongodb')
const mongoClient = mongodb.MongoClient
const MONGO_URL = process.env.MONGODB_URL

module.exports = (async () => {
    const client = await mongoClient.connect(MONGO_URL,{
        useNewUrlParser: true,
        useUnifiedTopology : true
    })
    // .catch((err) => {
    //     console.error(`Cannot connect to MpongoDB : ${err}`)
    //     res.status(500).json({error:err})
    //     return
    // })
    return client 
})()
