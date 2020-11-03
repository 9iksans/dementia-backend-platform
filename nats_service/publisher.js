const NATS =require("nats")
const nc  = NATS.connect("localhost:4222")

for (var i = 0 ; i < 10; i++){
    nc.publish("coba", "Hello World", ()=>{
        console.log("Done")
    })
}

nc.on("reconnect", (nc)=>{
    console.log("RETRYING CONNECTING TO SERVER")
})