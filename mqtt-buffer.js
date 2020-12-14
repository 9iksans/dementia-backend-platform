
const mqtt = require('mqtt')
var path = require("path");
var fs = require("fs");
const db = require('./dbconnect')
const Joi = require('@hapi/joi')

const hostmqtt = process.env.HOSTMQTT || "x2.hcm-lab.id";
const portmqtt = process.env.PORTMQTT || 1883;
const dementiaAction = db.get('dementiaAction')


const schemaAction = Joi.object({
  userID : Joi.string().trim().required(),
  edgeSource : Joi.string().trim().required(),
  action : Joi.string().trim().required(),
  time : Joi.date().iso(),
})


// mqtt


var clientmqtt = mqtt.connect("tcp://"+hostmqtt+":"+portmqtt)

clientmqtt.on('connect', function () {
  clientmqtt.subscribe('/action/image',{qos:1});
  clientmqtt.subscribe('/action/imrecog/#',{qos:1});
  clientmqtt.subscribe('/action/audio',{qos:1});
  clientmqtt.subscribe('/action/aurecog/#',{qos:1});
  console.log('clientmqtt has subscribed successfully');
});


function decode_base64img(base64str,folder, filename) {

  var buf = Buffer.from(base64str, "base64");

  if (!fs.existsSync(__dirname+"/images/"+folder)){
    fs.mkdirSync(__dirname+"/images/"+folder);
    fs.writeFile(path.join(__dirname, "/images/" + folder +"/", filename), buf, function (
      error
    ) {
      if (error) {
        throw error;
      } else {
        console.log("File created from base64 string!");
        return true;
      }
    });

  }else{
    console.log("Directory already exist");
    fs.writeFile(path.join(__dirname, "/images/" + folder +"/", filename), buf, function (
      error
    ) {
      if (error) {
        throw error;
      } else {
        console.log("File created from base64 string!");
        return true;
      }
    });

  }
}

function decode_base64aud(base64str,folder, filename) {

  var buf = Buffer.from(base64str, "base64");

  if (!fs.existsSync(__dirname+"/audios/"+folder)){
    fs.mkdirSync(__dirname+"/audios/"+folder);
    fs.writeFile(path.join(__dirname, "/audios/" + folder +"/", filename), buf, function (
      error
    ) {
      if (error) {
        throw error;
      } else {
        console.log("File created from base64 string!");
        return true;
      }
    }); 

  }else{
    console.log("Directory already exist");
    fs.writeFile(path.join(__dirname, "/audios/" + folder +"/", filename), buf, function (
      error
    ) {
      if (error) {
        throw error;
      } else {
        console.log("File created from base64 string!");
        return true;
      }
    });

  }
}


clientmqtt.on('message', async function(topic, messagemqtt){
  if(topic === '/action/image'){
    messagemqtt = JSON.parse(messagemqtt.toString())
    decode_base64img(messagemqtt.image.toString(), messagemqtt.imrecog.toString(), "img-"+Date.now()+".jpg");
  }

  if(topic === '/action/audio'){
    messagemqtt = JSON.parse(messagemqtt.toString())
    decode_base64aud(messagemqtt.audio.toString(), messagemqtt.aurecog.toString(),"aud-"+Date.now()+".jpg");
  }

  var cropTopic = topic.substring(0,15)
  if(cropTopic === '/action/imrecog'){
    // console.log(messagemqtt.toString())
    var time = new Date()
    time.setHours( time.getHours() + 7 );
    var actionImange = {
      "userID" : topic.substring(16,topic.length),
      "edgeSource": "image",
      "action" : messagemqtt.toString(),
      "time" : time
    }
    const value = await schemaAction.validateAsync(actionImange);
    const inserted = await dementiaAction.insert(value)
    console.log(inserted);
  }

  if(cropTopic === '/action/aurecog'){
    var time = new Date()
    time.setHours( time.getHours() + 7 );
    var actionImange = {
      "userID" : topic.substring(16,topic.length),
      "edgeSource": "audio",
      "action" : messagemqtt.toString(),
      "time" : time
    }
    const value = await schemaAction.validateAsync(actionImange);
    const inserted = await dementiaAction.insert(value)
    console.log(inserted);
  }
  
})


