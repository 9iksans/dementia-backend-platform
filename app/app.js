const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const authUser = require('../routes/auth')
const cors = require('cors')
const WebSocket = require('ws');
const userData = require("../routes/userData") 
const dementiaData = require("../routes/dementiaData") 
const actionData = require('../routes/dementiaAction')
const morgan = require('morgan')
const { Kafka } = require("kafkajs");
const jwt = require('jsonwebtoken')

var dementiaUserId
const app = express()

app.use(bodyParser.json())
bodyParser.urlencoded({extended:false})

app.use(cors())
app.use(morgan('dev'))



app.use("/api/userdata", userData)
app.use("/api/dementiadata", dementiaData)
app.use("/api/auth", authUser)
app.use("/api/actiondata", actionData)
app.use('/api/profileimage',express.static(path.join(__dirname,'../profileimage')));



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
