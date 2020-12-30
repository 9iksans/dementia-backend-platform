const express = require('express')
const path = require('path')
const jwt = require('jsonwebtoken')
const db =require('../app/dbconnect')





const jwtGenerator = db.get('jwtGenerator')

const router = express.Router()

router.get('/index-stream/:userID', async(req, res, next)=>{
    
    const token = req.query.tokenID
    if(!token) return res.status(401).json({
        response : "error",
        message : "Accsess Denied"
    })

    try {
        const jwtLastToken = await jwtGenerator.findOne({_id : "5fe9958c9812e80616321bb4"})
        const verified = jwt.verify(token,jwtLastToken.jwtLastToken)
        req.user = verified
        res.sendFile(path.join(__dirname + '../../website/streaming/index-stream.html'));
    } catch (error) {
        res.status(400).json({
            response : "error",
            message : "Invalid Token"
        })
    }

    
    
})
module.exports = router;