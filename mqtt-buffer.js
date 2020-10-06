const kafka = require('kafka-node');
const mqtt = require('mqtt')

const port = process.env.PORT;
const host = process.env.HOST;
const hostmqtt = process.env.HOSTMQTT;
const portmqtt = process.env.PORTMQTT;

const Producer = kafka.Producer;
const client = new kafka.KafkaClient({kafkaHost: host+":"+port});
const producer = new Producer(client);



// mqtt


var clientmqtt = mqtt.connect("tcp://"+hostmqtt+":"+portmqtt)
clientmqtt.on('connect', function () {
  clientmqtt.subscribe('image',{qos:1});
  clientmqtt.subscribe('namefile',{qos:1});
  console.log('clientmqtt has subscribed successfully');
});

clientmqtt.on('message', function(topic, messagemqtt){
  if(topic === 'namefile'){
    var nameimagemqtt = messagemqtt
    let payloads = [{
            topic : 'namefile',
            messages : nameimagemqtt.toString()
        }]
    
    console.log(nameimagemqtt.toString())
    
    producer.send(payloads, (err, data) => {
        if (err) {
          console.log('[kafka-producer -> namefile]: broker update failed');
        } else {
          console.log('[kafka-producer -> namefile]: broker update success');
        }
      });
      
  }

  if(topic === 'image'){
    var imagemqtt = messagemqtt
        let payloads =[{
            topic : 'image',
            messages : imagemqtt.toString()
        }]
        producer.send( payloads, (err, data) => {
          if (err) {
            console.log('[kafka-producer -> image]: broker update failed');
          } else {
            console.log('[kafka-producer -> image]: broker update success');
          }
        });
      
  }

  
})


