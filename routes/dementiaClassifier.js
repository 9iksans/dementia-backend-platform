const express = require('express')
const path = require('path')
const db = require('../app/dbconnect')
const bodyParser = require('body-parser')
const verify = require('./verifyToken')
const Joi = require('@hapi/joi')
const { join } = require('path')
const { error, time } = require('console')
const { set } = require('../app/app')



const router = express.Router()
const dementiaMSEEQuestion = db.get('dementiaMSEE')




//scheme for post dataAction
const schemaAction = Joi.object({
    userID : Joi.string().trim().required(),
    edgeSource : Joi.string().trim().required(),
    action : Joi.string().trim().required(),
    time : Joi.string().trim().required(),
})


//get

router.get('/all',verify, async(req, res, next)=>{
    try {
        const value = await dementiaMSEEQuestion.find()
        res.json(value)
    } catch (error) {
        next(error)
    }
})

router.get('/:number',verify, async(req, res, next)=>{
    try {
        const number = req.params.number
        const value = await dementiaMSEEQuestion.findOne({number : parseInt(number) })
        res.json(value)
    } catch (error) {
        next(error)
    }
})


//post
// router.post('/',verify,async (req, res, next)=>{
//    try {
//     const value = await schema.validateAsync(req.body);
//     const inserted = await dementiaMSEEQuestion.insert(value)
//     res.json({
//         response : "success",
//         message : inserted
//     })
//    } catch (error) {
//     next(error)
//    }
// })


// router.put('/:userID',verify,async(req, res, next)=>{
//     try {
//         const value = await schema.validateAsync(req.body)
        
//         const { userID } = req.params
//         const findUser = await dementiaMSEEQuestion.findOne({_id : userID})
//         if(!findUser) return next()

//         const update = await dementiaMSEEQuestion.update({_id : userID}, { $set : value})
//         res.json(update)
        
//     } catch (error) {
//         next(error)
//     }
// })

// router.delete('/:userID',verify,async (req, res, next)=>{
//     try {
//         const {userID} = req.params
//         const findUser = await dementiaMSEEQuestion.findOne({_id : userID})
//         if(!findUser) return next()

//         await dementiaMSEEQuestion.remove({ _id : userID})
//         res.status(200).json({
//             message: "Delete Success"
//         })
//     } catch (error) {
//         next(error)
//     }
// })


module.exports = router;