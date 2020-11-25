const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
    const token = req.header('auth-token')
    if(!token) return res.status(401).json({
        response : "error",
        message : "Accsess Denied"
    })

    try {
        const verified = jwt.verify(token,"asdkajsdklajslkdj")
        req.user = verified
        next()
    } catch (error) {
        res.status(400).json({
            response : "error",
            message : "Invalid Token"
        })
    }
    
}