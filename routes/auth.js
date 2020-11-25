const express = require('express')
const db = require('../app/dbconnect')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const Joi = require('@hapi/joi')
const {
    join
} = require('path')
const {
    error
} = require('console')
const {
    set
} = require('../app/app')
const md5 = require('md5')

const router = express.Router()
const userData = db.get('userData')


//scheme for post dataUser
const schemaRegister = Joi.object({
    username: Joi.string().trim().required(),
    password: Joi.string().required().trim(),
    name: Joi.string().trim().required(),
    profile: Joi.string().trim().optional(),
})

const schemaLogin = Joi.object({
    username: Joi.string().trim().required(),
    password: Joi.string().required().trim(),
    
})



//post
router.post('/register', async (req, res, next) => {
    try {
        const value = await schemaRegister.validateAsync(req.body)

        const usernameExist = await userData.findOne({
            username: req.body.username
        })
        if (usernameExist) return res.status(400).json({
            status: "error",
            message: "username already exist"
        })


        //change pass to md5 
        value.password = md5(req.body.password)
        const inserted = await userData.insert(value)
        res.json({
            response: "success",
            message: inserted
        })

    } catch (error) {
        next(error)
    }
})


router.post('/login', async (req, res, next) => {
    try {
        const value = await schemaLogin.validateAsync(req.body);

        const usernameExist = await userData.findOne({
            username: req.body.username
        })
        if (!usernameExist) {
            return res.status(400).json({
            status: "error",
            message: "username or password is wrong"
        })
        }else{
            //convert password req to md5
            value.password = md5(req.body.password)

            
            if (value.password != usernameExist.password) return res.status(400).json({
                status: "error",    
                message: "Invalid Password"
            })
    
            const token = jwt.sign({_id : usernameExist._id},"asdkajsdklajslkdj")
    
            res.header('auth-token',token).json({
                response: "success",
                message: "Loged In, with token "+token
            })
        }

       
    } catch (error) {
        next(error)
    }
})





module.exports = router;