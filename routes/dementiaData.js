const express = require('express')
const path = require('path')
const multer = require('multer')
const db = require('../app/dbconnect')
const bodyParser = require('body-parser')
const Joi = require('@hapi/joi')
const { join } = require('path')
const { error } = require('console')
const { set } = require('../app/app')

const router = express.Router()
const dementiaData = db.get('dementiaData')



//for uploading image
const diskStorage = multer.diskStorage({ 
    destination : function (req,file, cb){
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
    name : Joi.string().trim().required(),
    age : Joi.number().required(),
    gender : Joi.string().trim().required(),
    diagnostic : Joi.string().trim().required(),
    urgent : Joi.string().trim().optional(),
    profile : Joi.string().trim().optional(),
})



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
router.get('/', async(req, res, next)=>{
    try {
        const value = await dementiaData.find({})
        res.json(value)
    } catch (error) {
        next(error)
    }
})


router.get('/recent', async(req, res, next)=>{
    try {
        const value = await dementiaData.find({diagnostic : "Dementia"}, {sort : {_id : -1}})
        res.json(value)
    } catch (error) {
        next(error)
    }
})

router.get('/urgent', async(req, res, next)=>{
    try {
        const value = await dementiaData.find({urgent : {$exists : true}}, {sort :{_id : -1}})
        res.json(value)
    } catch (error) {
        next(error)
    }
})
router.get('/:userID', async(req, res, next)=>{
    try {
        const { userID }= req.params;
        const value = await dementiaData.findOne({_id : userID})
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

router.get('/username/:userAlias', async(req, res, next)=>{
    try {
        const {userAlias} = req.params;
        const value = await dementiaData.find({name : userAlias})
        if(!value) return next()
        return res.json(value)
    } catch (error) {
        next(error)
    }
})

//post
router.post('/',async (req, res, next)=>{
   try {
    const value = await schema.validateAsync(req.body);
    const inserted = await dementiaData.insert(value)
    res.json({
        response : "success",
        message : inserted
    })
   } catch (error) {
    next(error)
   }
})


router.put('/:userID',async(req, res, next)=>{
    try {
        const value = await schema.validateAsync(req.body)
        
        const { userID } = req.params
        const findUser = await dementiaData.findOne({_id : userID})
        if(!findUser) return next()

        const update = await dementiaData.update({_id : userID}, { $set : value})
        res.json(update)
        
    } catch (error) {
        next(error)
    }
})

router.delete('/:userID',async (req, res, next)=>{
    try {
        const {userID} = req.params
        const findUser = await dementiaData.findOne({_id : userID})
        if(!findUser) return next()

        await dementiaData.remove({ _id : userID})
        res.status(200).json({
            message: "Delete Success"
        })
    } catch (error) {
        next(error)
    }
})



module.exports = router;