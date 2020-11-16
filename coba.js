const kafka = require('kafka-node');

const Producer = kafka.Producer;
const client = new kafka.KafkaClient({kafkaHost: "x2.hcm-lab.id:9092"});
const producer = new Producer(client);


let payloads =[{
    topic : 'streaming.image',
    messages : "okay"
}]

producer.send(payloads, (err, data) => {
    if (err) {
      console.log('[kafka-producer -> namefile]: broker update failed');
    } else {
      console.log('[kafka-producer -> namefile]: broker update success');
    }
  });