const express = require('express');
const cors = require('cors');
const { Kafka } = require("kafkajs");
const dotenv = require('dotenv');
var path = require("path");
var fs = require("fs");
const mqtt = require('mqtt')

//port
const port = process.env.PORT;
const host = process.env.HOST;
const hostmqtt = process.env.HOSTMQTT;
const portmqtt = process.env.PORTMQTT;

///KAFKA CREATE TOPIC

// var kafkaCreateTopic = require('kafka-node');
// var clientCreateTopic = new kafkaCreateTopic.KafkaClient();
// var topicsToCreate = [{
//   topic: 'action.namefile',
//   partitions : 1,
//   replicationFactor: 1,
//   },{
//   topic: 'action.image',
//   partitions : 1,
//   replicationFactor: 1,
//   },]

// clientCreateTopic.createTopics(topicsToCreate, (error, result) => {
//   console.log(result);
// });

const app = express();
// dotenv.config();
app.use(cors())

var clientmqtt = mqtt.connect("tcp://"+hostmqtt+":"+portmqtt)

const kafka = new Kafka({
  clientId: "my-app",
  brokers: [ host+":" + port],
});



const consumer_image = kafka.consumer({ groupId: "image-group-image" });

function decode_base64(base64str, filename) {
  var buf = Buffer.from(base64str, "base64");

  fs.writeFile(path.join(__dirname, "/images/", filename), buf, function (
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



const runKafkaSubs =async()=>{
  var namefile = null;
  consumer_image.connect();
  consumer_image.subscribe({ topic: "action.namefile", fromBeginning: true });
  consumer_image.subscribe({ topic: "action.image", fromBeginning: true });
    
  consumer_image.run({
    eachMessage: async ({ topic, partition, message }) => {
      
      if(topic === "action.namefile"){
        console.log(message.value.toString());
        namefile=message.value.toString();
        
      }

      if (topic === "action.image"){
        decode_base64(message.value.toString(), namefile+Date.now()+".jpg");
      }

      if (topic === "streaming.image"){
        clientmqtt.publish('/streaming/image', message.value.toString())
      }
      
           
    },
  });


}
  

runKafkaSubs().catch(e => console.error(`[example/consumer]`, e))
//run().catch(e => console.error(`[example/consumer]`, e))

