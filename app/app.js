const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const cors = require('cors')
const WebSocket = require('ws');
const userData = require("../routes/userData") 
const dementiaData = require("../routes/dementiaData") 
const morgan = require('morgan')
const { Kafka } = require("kafkajs");

var dementiaUserId
const app = express()

app.use(bodyParser.json())
bodyParser.urlencoded({extended:false})

app.use(cors())
app.use(morgan('dev'))



app.use("/userdata", userData)
app.use("/dementiadata", dementiaData)
app.use('/assets',express.static(path.join(__dirname,'../website/assets')));
app.use('/profileimage',express.static(path.join(__dirname,'../profileimage')));



app.get('/streaming/index-stream/:userID', async(req, res, next)=>{

    res.sendFile(path.join(__dirname + '../../website/streaming/index-stream.html'));
    
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
