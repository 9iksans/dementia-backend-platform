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
const dementiaAction = db.get('dementiaAction')

Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
}



//scheme for post dataAction
const schemaAction = Joi.object({
    userID : Joi.string().trim().required(),
    edgeSource : Joi.string().trim().required(),
    action : Joi.string().trim().required(),
    time : Joi.string().trim().required(),
})


//get


router.get('/:edgeSource/:userID',verify, async(req, res, next)=>{
    var time = new Date();
    time.setHours( time.getHours() - time.getHours() );
    try {
        const actRec = req.query.actRec
        const userID = req.params.userID
        const edgeSource = req.params.edgeSource
        var value 
        if(actRec == null){
            value = await dementiaAction.find({userID : userID , edgeSource : edgeSource, "time" :  {"$gte": time} } )
            if(!value) return next()
        }else{
            value = await dementiaAction.find({userID : userID, action : actRec, edgeSource : edgeSource, "time" :  {"$gte": time} } )
            if(!value) return next()
        }
        
        return res.json(value)
    } catch (error) {
        next(error)
    }
})

router.get('/:edgeSource/:userID/:timeFilter',verify, async(req, res, next)=>{

    try {
        const userID = req.params.userID;
        const actRec = req.query.actRec
        const edgeSource = req.params.edgeSource
        const timeFilter = req.params.timeFilter;

        const timeUntil = new Date(timeFilter.toString())
        timeUntil.setDate( timeUntil.getDate() + 1 );

        var value
        if(actRec == null){
            value = await dementiaAction.find({userID : userID, edgeSource : edgeSource, "time" :  {"$gte": new Date(timeFilter.toString()), "$lt": timeUntil} } )
            if(!value) return next()
        }else{
            value = await dementiaAction.find({userID : userID, action : actRec, edgeSource : edgeSource, "time" :  {"$gte": new Date(timeFilter.toString()), "$lt": timeUntil} } )
            if(!value) return next()
        }

        return res.json(value)
    } catch (error) {
        next(error)
    }
})



//post
router.post('/',verify,async (req, res, next)=>{
   try {
    const value = await schema.validateAsync(req.body);
    const inserted = await dementiaAction.insert(value)
    res.json({
        response : "success",
        message : inserted
    })
   } catch (error) {
    next(error)
   }
})


router.put('/:userID',verify,async(req, res, next)=>{
    try {
        const value = await schema.validateAsync(req.body)
        
        const { userID } = req.params
        const findUser = await dementiaAction.findOne({_id : userID})
        if(!findUser) return next()

        const update = await dementiaAction.update({_id : userID}, { $set : value})
        res.json(update)
        
    } catch (error) {
        next(error)
    }
})

router.delete('/:userID',verify,async (req, res, next)=>{
    try {
        const {userID} = req.params
        const findUser = await dementiaAction.findOne({_id : userID})
        if(!findUser) return next()

        await dementiaAction.remove({ _id : userID})
        res.status(200).json({
            message: "Delete Success"
        })
    } catch (error) {
        next(error)
    }
})


module.exports = router;