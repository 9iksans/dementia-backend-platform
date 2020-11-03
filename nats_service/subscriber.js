const NATS =require("nats")
const nc = NATS.connect("localhost:4222")

nc.subscribe("coba", function (message) {
    console.log(message);
    
})