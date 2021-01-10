const express = require('express')
const path = require('path')
const sio = require('../rest')
const multer = require('multer')
const db = require('../app/dbconnect')
const bodyParser = require('body-parser')
const verify = require('./verifyToken')
const Joi = require('@hapi/joi')
const { join } = require('path')
const { error } = require('console')
const { set } = require('../app/app')
const http = require('http')
const { Kafka } = require("kafkajs");

var elastic = require('../app/elasticconnect');  


const router = express.Router()
const dementiaData = db.get('dementiaData')
const dementiaMSEEAnswer = db.get('dementiaAnswerMSEE')





//for uploading image
const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../profileimage"))
    },
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        )
    }
})

var upload = multer({ storage: diskStorage })


//scheme for post dataUser
const schema = Joi.object({
    name: Joi.string().trim().required(),
    age: Joi.number().required(),
    gender: Joi.string().trim().required(),
    diagnostic: Joi.string().trim().required(),
    urgent: Joi.string().trim().optional(),
    profile: Joi.string().trim().optional(),
    userdoctor: Joi.string().trim().required(),
})

// var schemaIndex = new Schema({
//     name: String,
//     age: Int16Array,
//     gender : String,
//     diagnostic : String,
//     urgent : String,
//     profile : String,
//     userDoctor : String,
//   });
  
var indexData = async function (data, id) {
    elastic.index({  
        index: 'dementia_index',
        id: id.toString(),
        type : '_doc',
        body: data
      },function(err,resp,status) {
          console.log(resp);
      });
} 




//post image

router.post('/uploadfile', upload.single('dementiaPhotos'), (req, res, next) => {
    const file = req.file
    if (!file) {
        const error = new Error('Please upload a file')
        error.httpStatusCode = 400
        return next(error)
    }
    res.send(file.filename)

})

//get
router.get('/all/:userDoctor', verify, async (req, res, next) => {
    try {
        const userDoctor = req.params.userDoctor;
        const value = await dementiaData.find({ $or: [{ diagnostic: "Not Dementia" }, { diagnostic: "Mild Dementia" }, { diagnostic: "Severe Dementia" }], userdoctor: userDoctor }, { sort: { _id: -1 } })
        res.json(value)
    } catch (error) {
        next(error)
    }
})

router.get('/recent/:userDoctor', verify, async (req, res, next) => {
    try {
        const userDoctor = req.params.userDoctor;
        const value = await dementiaData.find({ $or: [{ diagnostic: "Dementia" }, { diagnostic: "Mild Dementia" }, { diagnostic: "Severe Dementia" }], userdoctor: userDoctor }, { sort: { _id: -1 } })
        res.json(value)
    } catch (error) {
        next(error)
    }
})

router.get('/urgent/:userDoctor', verify, async (req, res, next) => {
    try {
        const userDoctor = req.params.userDoctor;
        const value = await dementiaData.find({ urgent: { $exists: true }, userdoctor: userDoctor }, { sort: { _id: -1 } })
        res.json(value)
    } catch (error) {
        next(error)
    }
})

router.get('/nevertested/:userDoctor', verify, async (req, res, next) => {
    try {
        const userDoctor = req.params.userDoctor;
        const value = await dementiaData.find({ diagnostic: "Never Tested", userdoctor: userDoctor }, { sort: { _id: -1 } })
        res.json(value)
    } catch (error) {
        next(error)
    }
})

router.get('/:userID', verify, async (req, res, next) => {
    try {
        const { userID } = req.params;
        const value = await dementiaData.findOne({ _id: userID })
        if (!value) {
            return res.json({
                message: "Error"
            })
        } else {
            return res.json(value)
        }
    } catch (error) {
        next(error)
    }
})

router.get('/username/:userAlias', verify, async (req, res, next) => {
    try {
        const { userAlias } = req.params;
        const value = await dementiaData.find({ name: userAlias })
        if (!value) return next()
        return res.json(value)
    } catch (error) {
        next(error)
    }
})



router.get('/s/:userDoctor/:obj', verify, async (req, res, next) => {
    
    try {
    const objek = req.params.obj.toString();
    const userDoctor = req.params.userDoctor.toString();
    console.log(objek)
    console.log(userDoctor) 
        elastic.search({  
            index: 'dementia_index',
            type: '_doc',
            body: {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "match": {
                                    "userdoctor": userDoctor
                                }
                            },
                            {
                                "bool": {
                                    "should": [
                                        {
                                            "match_phrase_prefix": {
                                                "name": objek
                                            }
                                        },
                                        {
                                            "match_phrase_prefix": {
                                                "diagnostic": objek
                                            }
                                        },
                                        {
                                            "prefix": {
                                                "name": objek
                                            }
                                        },
                                        {
                                            "prefix": {
                                                "diagnostic": objek
                                            }
                                        }
                                        
                                    ]
                                }
                            }
                        ]
                    }
                }
            }
          },function (error, response,status) {
              if (error){
                console.log("search error: "+error)
                return next()
              }
              else {
                return res.json(response.hits.hits)
              }
          });
        
        
    } catch (error) {
        next(error)
    }
})

//post
router.post('/', verify, async (req, res, next) => {
    try {
        const value = await schema.validateAsync(req.body);

        const inserted = await dementiaData.insert(value)
        res.json({
            response: "success",
            message: inserted
        })

        indexData(req.body, inserted._id)
        if (inserted.diagnostic == "Dementia") {
            kafkaStreaming(inserted._id.toString())
        }
        if (inserted.diagnostic === "Never Tested") {
            var dataTest = {
                "dementiaID": inserted._id.toString(),
                "1": "null",
                "2": "null",
                "3": "null",
                "4": "null",
                "5": "null",
                "6": "null",
                "7": "null",
                "8": "null",
                "9": "null",
                "10": "null",
                "11": "null",
            }
            const insertTest = await dementiaMSEEAnswer.insert(dataTest)

        }
    } catch (error) {
        next(error)
    }
})


router.put('/elastic/:userID', verify, async (req, res, next) => {
    try {
        const value = await schema.validateAsync(req.body)

        const { userID } = req.params
        const findUser = await dementiaData.findOne({ _id: userID })
        if (!findUser) return next()

        const update = await dementiaData.update({ _id: userID }, { $set: value })
        res.json(update)
        indexData(req.body, update._id)

    } catch (error) {
        next(error)
    }
})

router.put('/:userID', verify, async (req, res, next) => {
    try {
        const value = await schema.validateAsync(req.body)

        const { userID } = req.params
        const findUser = await dementiaData.findOne({ _id: userID })
        if (!findUser) return next()

        const update = await dementiaData.update({ _id: userID }, { $set: value })
        res.json(update)

    } catch (error) {
        next(error)
    }
})

router.delete('/:userID', verify, async (req, res, next) => {
    try {
        const userID = req.params.userID
        const findUser = await dementiaData.findOne({ _id: userID })
        if (!findUser) return next()

        await dementiaData.remove({ _id: userID })
        res.status(200).json({
            message: "Delete Success"
        })
        elastic.delete({  
            index: 'dementia_index',
            id: userID.toString(),
            type: '_doc'
          },function(err,resp,status) {
              console.log(resp);
          });
    } catch (error) {
        next(error)
    }
})



const kafka = new Kafka({
    clientId: "my-app",
    brokers: ["192.168.1.36:9092"],
});

const kafkaStreaming = async (dementiaID) => {

    var consumer_image = kafka.consumer({ groupId: "streaming-group-" + dementiaID });
    await consumer_image.connect();
    await consumer_image.subscribe({ topic: "streaming.image." + dementiaID, fromBeginning: false });
    await consumer_image.run({
        eachMessage: async ({ topic, partition, message }) => {
            if (topic === "streaming.image." + dementiaID) {
                sio.soket(dementiaID.toString(), message.value.toString())

            }
        }
    });
}

module.exports = router;