const express = require('express');
const cors = require('cors');
const { Kafka } = require("kafkajs");
const dotenv = require('dotenv');
var path = require("path");
var fs = require("fs");

//port
const port = process.env.PORT;
const host = process.env.HOST;

const app = express();
// dotenv.config();
app.use(cors())

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
  consumer_image.subscribe({ topic: "/action/namefile", fromBeginning: true });
  consumer_image.subscribe({ topic: "/action/image", fromBeginning: true });
    
  consumer_image.run({
    eachMessage: async ({ topic, partition, message }) => {
      
      if(topic === "/action/namefile"){
        console.log(message.value.toString());
        namefile=message.value.toString();
        
      }

      if (topic === "/action/image"){
        decode_base64(message.value.toString(), namefile+".jpg");
      }
           
    },
  });


}
  

runKafkaSubs().catch(e => console.error(`[example/consumer]`, e))
//run().catch(e => console.error(`[example/consumer]`, e))

