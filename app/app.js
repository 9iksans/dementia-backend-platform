const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const cors = require('cors')
const userData = require("../routes/userData") 
const dementiaData = require("../routes/dementiaData") 
const morgan = require('morgan')


const app = express()

app.use(bodyParser.json())
bodyParser.urlencoded({extended:false})

app.use(cors())
app.use(morgan('dev'))


app.use('/profileimage',express.static(path.join(__dirname,'../profileimage')));
app.use("/userdata", userData)
app.use("/dementiadata", dementiaData)

app.get("/index",(req,res)=>{
    res.sendFile(__dirname + "/index.html")
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