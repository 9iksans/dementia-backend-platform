const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const userData = require("../routes/userData") 
const morgan = require('morgan')


const app = express()

app.use(bodyParser.json())
bodyParser.urlencoded({extended:false})

app.use(cors())
app.use(morgan('dev'))


app.use("/userdata", userData)

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

app.get("/",(req,res)=>{
    res.json({
        message : "this is homepage"
    })
})

module.exports = app