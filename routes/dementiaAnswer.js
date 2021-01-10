const express = require('express')
const path = require('path')
const db = require('../app/dbconnect')
const bodyParser = require('body-parser')
const verify = require('./verifyToken')
const Joi = require('@hapi/joi')
const { join } = require('path')
const { error, time } = require('console')
const { set } = require('../app/app')
const { Kafka } = require("kafkajs");
const sio = require("../rest")
const elastic = require('../app/elasticconnect')



const router = express.Router()
const dementiaMSEEAnswer = db.get('dementiaAnswerMSEE')
const dementiaData = db.get('dementiaData')

var indexData = async function (data, id) {
    delete data._id
    elastic.index({  
        index: 'dementia_index',
        id: id.toString(),
        type : '_doc',
        body: data
      },function(err,resp,status) {
          console.log(resp);
      });
} 



//scheme for post dataAction
const schemaAction = Joi.object({
    userID : Joi.string().trim().required(),
    edgeSource : Joi.string().trim().required(),
    action : Joi.string().trim().required(),
    time : Joi.string().trim().required(),
})

const schemaAnswer = Joi.object({
    1 : Joi.string().trim().required(),
    2 : Joi.string().trim().required(),
    3 : Joi.string().trim().required(),
    4 : Joi.string().trim().required(),
    5 : Joi.string().trim().required(),
    6 : Joi.string().trim().required(),
    7 : Joi.string().trim().required(),
    8 : Joi.string().trim().required(),
    9 : Joi.string().trim().required(),
    10 : Joi.string().trim().required(),
    11 : Joi.string().trim().required(),
    dateTest : Joi.date().iso().optional(),
})

Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
}
//get

router.get('/:dementiaID',verify, async(req, res, next)=>{
    try {
        const dementiaID = req.params.dementiaID
        const value = await dementiaMSEEAnswer.findOne({dementiaID : dementiaID })
        res.json(value)
    } catch (error) {
        next(error)
    }
})


//post
// router.post('/',verify,async (req, res, next)=>{
//    try {
//     const value = await schema.validateAsync(req.body);
//     const inserted = await dementiaMSEEAnswer.insert(value)
//     res.json({
//         response : "success",
//         message : inserted
//     })
//    } catch (error) {
//     next(error)
//    }
// })


router.put('/:dementiaID',verify,async(req, res, next)=>{
    try {
        const value = await schemaAnswer.validateAsync(req.body)
        
        const dementiaID = req.params.dementiaID
        const findAnswer = await dementiaMSEEAnswer.findOne({dementiaID : dementiaID})
        if(!findAnswer) return next()

        const update = await dementiaMSEEAnswer.update({dementiaID : dementiaID}, { $set : value})
        res.json(value)
        
    } catch (error) {
        next(error)
    }
})

router.put('/:dementiaID/11',verify,async(req, res, next)=>{
    try {
        const value = await schemaAnswer.validateAsync(req.body)
        
        const dementiaID = req.params.dementiaID
        
        var time = new Date()
        time.setHours( time.getHours() + 7 );
        value['dateTime'] = time
        
        const updateAnswer = await dementiaMSEEAnswer.update({dementiaID : dementiaID}, { $set : value})
        //res.json(value)
        
        const findAnswer = await dementiaMSEEAnswer.findOne({dementiaID : dementiaID})
        if(!findAnswer) return next()

        const findUser = await dementiaData.findOne({_id : dementiaID})
        if(!findUser) return next()

        var sumData =0, diagnostic
        for(var i = 1; i <=11; i++){
            sumData = sumData + parseInt(findAnswer[i])
        }
        if(sumData >= 23){
            diagnostic = "Not Dementia"
        }else if(sumData <= 22 && sumData >=18){
            diagnostic = "Mild Dementia"
        }else{
            diagnostic = "Severe Dementia"
        }

        
        
        
        findUser.diagnostic = diagnostic
       
        const updateUser = await dementiaData.update({_id : dementiaID}, { $set : findUser})
        if(diagnostic == "Mild Dementia" || diagnostic == "Severe Dementia"){
            kafkaStreaming(findUser._id.toString())
        }
        res.json(findUser)
        
        indexData(findUser, dementiaID)
        
        
    } catch (error) {
        next(error)
    }
})

const kafka = new Kafka({
    clientId: "my-app",
    brokers: [ "192.168.1.36:9092"],
  });
  
const kafkaStreaming = async(dementiaID)=>{
    
    var consumer_image = kafka.consumer({ groupId: "streaming-group-"+dementiaID });
    await consumer_image.connect();
    await consumer_image.subscribe({ topic: "streaming.image."+dementiaID, fromBeginning: false });
    await consumer_image.run({
        eachMessage: async ({ topic, partition, message }) => {
        if(topic === "streaming.image."+dementiaID){
                sio.soket(dementiaID.toString(),message.value.toString())
   
            }
        }
      });
}
// router.delete('/:userID',verify,async (req, res, next)=>{
//     try {
//         const {userID} = req.params
//         const findUser = await dementiaMSEEAnswer.findOne({_id : userID})
//         if(!findUser) return next()

//         await dementiaMSEEAnswer.remove({ _id : userID})
//         res.status(200).json({
//             message: "Delete Success"
//         })
//     } catch (error) {
//         next(error)
//     }
// })


module.exports = router;