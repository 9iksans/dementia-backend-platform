const http = require('http')
const port = process.env.PORT || 3000
const { Kafka } = require("kafkajs");
const app = require('./app/app')
const rest = http.createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server:rest });
const imageToBase64 = require('image-to-base64');
const { response } = require('./app/app');


var sImage

imageToBase64("./website/assets/iconload.png").then(
    (response) => {
        sImage = response
    }
)

const kafka = new Kafka({
    clientId: "my-app",
    brokers: [ "x2.hcm-lab.id:9092"],
  });
  
  
  
const consumer_image = kafka.consumer({ groupId: "streaming-group" });

const kafkaStreaming = async()=>{
    await consumer_image.connect();
    await consumer_image.subscribe({ topic: "streaming.image", fromBeginning: false });
    await consumer_image.run({
        eachMessage: async ({ topic, partition, message }) => {
          if( await topic === "streaming.image"){
            wss.clients.forEach( async function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message.value.toString())
                }
              });
          }
               
        },
      });
}

kafkaStreaming();

wss.on('connection',function connection(ws) {
    console.log("New Client Connected")
  });

wss.on('close', function close() {
    console.log("print connection close")
  });

rest.listen(port,()=>{
    console.log("listening to port "+port)
})

