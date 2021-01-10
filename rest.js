
const { func } = require('@hapi/joi');
const http = require('http')
const port = process.env.PORT || 3000
const allowSocketCors = process.env.CORS || "http://localhost:3001"
const { Kafka } = require("kafkajs");
const { get } = require('./app/app');
const app = require('./app/app')
const rest = http.createServer(app);
const io = require('socket.io')(rest, {
    cors: {
      origin: allowSocketCors,
      methods: ["GET", "POST"]
    }
  });
const db = require('./app/dbconnect')




var demensiaID = "";
io.sockets.on('connection',(socket)=>{
    console.log("New User Connected")

        
})

const dementiaData = db.get('dementiaData')
var dataUser, dataLeng
var getDatabase=  async function(){
    try {
        var value = await dementiaData.find({ $or : [{diagnostic : "Dementia"}, {diagnostic : "Mild Dementia"}, {diagnostic : "Severe Dementia"}]}, {sort : {_id : -1}})
        dataUser = value
        dataLeng = value.length
        return createKafka()

    } catch (error) {
        console.log(error)
    }
    
    
}



const kafka = new Kafka({
    clientId: "my-app",
    brokers: [ "192.168.1.36:9092"],
  });
  
var consumer_image = []
  
const kafkaStreaming = async(dementiaID, index)=>{
    
    consumer_image[index] = kafka.consumer({ groupId: "streaming-group-"+dementiaID });
    await consumer_image[index].connect();
    await consumer_image[index].subscribe({ topic: "streaming.image."+dementiaID, fromBeginning: false });
    await consumer_image[index].run({
        eachMessage: async ({ topic, partition, message }) => {
        if(topic === "streaming.image."+dementiaID){
            io.sockets.emit(dementiaID.toString(),message.value.toString())
                // console.log(dementiaID)
            }
        }
      });
}

const createKafka = ()=> {
    for (const index in dataUser){
        kafkaStreaming(dataUser[index]._id.toString(), index);

    }
}

getDatabase();


rest.listen(port,()=>{
    console.log("listening to port "+port)
})




const soket = (dementiaID, data)=> {
    io.sockets.emit(dementiaID.toString(),data.toString())
    //return console.log("masuk")
}
exports.soket = soket
