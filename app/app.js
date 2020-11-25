const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const authUser = require('../routes/auth')
const cors = require('cors')
const WebSocket = require('ws');
const userData = require("../routes/userData") 
const dementiaData = require("../routes/dementiaData") 
const morgan = require('morgan')
const { Kafka } = require("kafkajs");
const jwt = require('jsonwebtoken')

var dementiaUserId
const app = express()

app.use(bodyParser.json())
bodyParser.urlencoded({extended:false})

app.use(cors())
app.use(morgan('dev'))



app.use("/userdata", userData)
app.use("/dementiadata", dementiaData)
app.use("/auth", authUser)
app.use('/assets',express.static(path.join(__dirname,'../website/assets')));
app.use('/profileimage',express.static(path.join(__dirname,'../profileimage')));



app.get('/streaming/index-stream/:userID', async(req, res, next)=>{
    
    const token = req.query.tokenID
    if(!token) return res.status(401).json({
        response : "error",
        message : "Accsess Denied"
    })

    try {
        const verified = jwt.verify(token,"asdkajsdklajslkdj")
        req.user = verified
        res.sendFile(path.join(__dirname + '../../website/streaming/index-stream.html'));
    } catch (error) {
        res.status(400).json({
            response : "error",
            message : "Invalid Token"
        })
    }

    
    
})



app.use((req,res,next)=>{
    const error = new Error("Not Found")
    error.status = 404
    next(error)
})

app.use((error,req,res,next)=>{
    res.status(error.status || 500)
    res.json({
        message : error.message
    })
})



module.exports = app
