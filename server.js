const express = require('express')
const mongodb = require('mongodb')
const bcrypt = require('bcryptjs')
const jwt  = require('jsonwebtoken')
const auth = require('./auth')
const { port,jwtkey }  = require('./config')

const app = express()


app.use(express.json())

// console.log(`MongoDB Url : ${process.env.MONGODB_URL}`)
app.post('/register',async (req,res)=>{
    let name =req.body.name
    let email =req.body.email
    let studentID = req.body.studentID
    let encryptesRwd =await bcrypt.hash(req.body.password, 8)

    const o = {
        name: name,
        email: email,
        studentID: studentID,
        password: encryptesRwd
    }
    const client = await require('./db')
    const db = client.db('buu')
    const r  = await db.collection('users')
        .insertOne(o)
        .catch((err)=>{
            console.error(`Cannot insert data to users collection: ${err}`)
            res.status(500).json({error:err})
            return
        })
        let result = { _id : o._id , name: o.name , email: o.email , studentID: o.studentID}
    res.status(201).json(result)
})



app.post('/sign-in',async (req,res) =>{
    //Credentail = Username, password... 
    let email = req.body.email 
    let password = req.body.password
    const client = await require('./db')
    const db = client.db('buu') 
    // Check email
    let user = await db.collection('users').findOne({email:email})
        .catch((err)=>{
            console.error(`Cannot find user with email ${err}`)
            res.status(500).json({error:err})
        })
        //Check user is not undefined ? 
    if(!user){
        res.status(401).json({error: `your given email have not been found`})
        return
    }

    let passwordIsValid = await bcrypt.compare(password , user.password) 
    //Check resulf is true ?
    if(!passwordIsValid){
        res.status(401).json({error: `username/password is not match`})
        return
    }
    //payload = data in token {email: user.email, id: user._id}
    //gentoken command = sign
    let token = await jwt.sign({email: user.email, id: user._id}, jwtkey , { expiresIn:30})
    res.status(200).json({token: token})
})


app.get('/me',auth, async (req,res)=>{  //auth = Authen 
    let decoded = req.decoded
    const client = await require('./db')
    let db = client.db('buu')
    let user = await  db.collection('users').findOne({_id: mongodb.ObjectID(decoded.id)}).catch((err)=>{
        console.error(`Cannot get user by id in /me : ${err}`)
        res.status(500).send({error:err})
        return
    })
    
    if(!user){
        res.status(401).json({error:'User was not found'})
        return
    }

    delete user.password
    res.json(user)
})

app.put('/me',auth,async (req,res)=>{
    let decoded = req.decoded
    const client = await require('./db')
    let db = client.db('buu')
    let mail = req.body.email
    let update = await db.collection('users').updateOne({_id: mongodb.ObjectID(decoded.id)},{$set:{"email":mail}}).catch((err)=>{
        console.error(`Cannot update profile: ${err}`)
        res.status(500).send({error:err})
        return
    })
    res.sendStatus(204)
    
})




app.listen(port,()=>{
    console.log(`App started at port ${port}`)
}) 