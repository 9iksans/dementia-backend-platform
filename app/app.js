const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const cors = require('cors')
const morgan = require('morgan')
const streamingData = require('../routes/streamingData')

const app = express()
app.use(bodyParser.json())
bodyParser.urlencoded({extended:false})

app.use(cors())
app.use(morgan('dev'))



app.use("/streaming", streamingData)
app.use('/assets',express.static(path.join(__dirname,'../website/assets')));


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
