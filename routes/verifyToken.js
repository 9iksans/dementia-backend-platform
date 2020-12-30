const jwt = require('jsonwebtoken')
const db =require('../app/dbconnect')

const jwtGenerator = db.get('jwtGenerator')

module.exports = async function(req, res, next) {
    const token = req.header('auth-token')
    if(!token) return res.status(401).json({
        response : "error",
        message : "Accsess Denied"
    })

    try {
        const jwtLastToken = await jwtGenerator.findOne({_id : "5fe9958c9812e80616321bb4"})
        const verified = jwt.verify(token,jwtLastToken.jwtLastToken)
        req.user = verified
        next()
    } catch (error) {
        res.status(400).json({
            response : "error",
            message : "Invalid Token"
        })
    }
    
}