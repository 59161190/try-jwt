const express = require('express')
const mongodb = require('mongodb')
const bcrypt = require('bcryptjs')


const app = express()
const port = process.env.PORT
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
    let email = req.body.email
    let password = req.body.password
    const client = await require('./db')
    const db = client.db('buu')
    let user = await db.collection('users').findOne({email:email})
        .catch((err)=>{
            console.error(`Cannot find user with email ${err}`)
            res.status(500).json({error:err})
        })

    if(!user){
        res.status(401).json({error: `your given email have not been found`})
        return
    }
    let passwordIsValid = await bcrypt.compare(password , user.password) 
    if(!passwordIsValid){
        res.status(401).json({error: `username/password is not match`})
        return
    }
    res.status(200).json({token: '12546789'})
})




app.listen(port,()=>{
    console.log(`App started at port ${port}`)
}) 