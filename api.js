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
const consumer_namefile = kafka.consumer({ groupId: "image-group-namefile" });
const consumer_action= kafka.consumer({ groupId: "image-group-nameaction" });

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
  consumer_namefile.connect();
  consumer_namefile.subscribe({ topic: "namefile", fromBeginning: true });

  consumer_namefile.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(message.value.toString());
      namefile=message.value.toString();
      //decode_base64(message.value, 'cek.'+format  );
      consumer_image.connect();
      consumer_image.subscribe({ topic: "image", fromBeginning: true });
    
      consumer_image.run({
        eachMessage: async ({ topic, partition, message }) => {
          //console.log(message.value.toString());
          decode_base64(message.value.toString(), namefile);
      },
        
      });
    },
  });


}
  
   

runKafkaSubs().catch(e => console.error(`[example/consumer]`, e))
//run().catch(e => console.error(`[example/consumer]`, e))


app.get('/', (req,res)=>{
    res.send('hello world')
})

app.get('/:id', (req,res)=>{
    res.send('hello world')
})

app.post('/nameaction', (req,res)=>{
    console.log(req.body);
})

app.post('/filename', (req,res)=>{
    console.log(req.body);
})


app.put('/:id', (req,res)=>{
    res.send('hello world')
})

app.listen(3000,()=>{
    console.log("App listen on http://localhost:"+3000)
})