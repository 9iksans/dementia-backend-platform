const express = require('express')
const db = require('../app/dbconnect')
const bodyParser = require('body-parser')
const verify = require('./verifyToken')
const Joi = require('@hapi/joi')
const { join } = require('path')
const { error } = require('console')
const { set } = require('../app/app')

const router = express.Router()
const userData = db.get('userData')


//scheme for post dataUser
const schema = Joi.object({
    name : Joi.string().trim().required(),
    age : Joi.number().required(),
    diagnostic : Joi.string().trim().required()
})



//get
router.get('/', verify, async(req, res, next)=>{
    try {
        const value = await userData.find({})
        res.json(value)
    } catch (error) {
        next(error)
    }
})

router.get('/:userID',  verify, async(req, res, next)=>{
    try {
        const { userID }= req.params;
        const value = await userData.findOne({_id : userID})
        if(!value) {
            return res.json({
                message : "Error"
            })
        }else{
            return res.json(value)
        }
        } catch (error) {
        next(error)
    }
})

router.get('/username/:userAlias', verify,async(req, res, next)=>{
    try {
        const {userAlias} = req.params;
        const value = await userData.find({username : userAlias})
        if(!value) return next()
        return res.json(value)
    } catch (error) {
        next(error)
    }
})

//post
router.post('/', verify,async (req, res, next)=>{
   try {
    const value = await schema.validateAsync(req.body);
    const inserted = await userData.insert(value)
    res.json({
        response : "success",
        message : inserted
    })
   } catch (error) {
    next(error)
   }
})


router.put('/:userID',  verify,async(req, res, next)=>{
    try {
        const value = await schema.validateAsync(req.body)
        
        const { userID } = req.params
        const findUser = await userData.findOne({_id : userID})
        if(!findUser) return next()

        const update = await userData.update({_id : userID}, { $set : value})
        res.json(update)
        
    } catch (error) {
        next(error)
    }
})

router.delete('/:userID',  verify,async (req, res, next)=>{
    try {
        const {userID} = req.params
        const findUser = await userData.findOne({_id : userID})
        if(!findUser) return next()

        await userData.remove({ _id : userID})
        res.status(200).json({
            message: "Delete Success"
        })
    } catch (error) {
        next(error)
    }
})



module.exports = router;