  
var mqtt = require('mqtt')
var client  = mqtt.connect('tcp://x2.hcm-lab.id:1883')
 
client.on('connect', function(){

    var pubs ={
        "image": "aaaaaaaa",
        "imrecog" : "Standing"
    }
    client.publish('/action/image',JSON.stringify(pubs), {qos:1});
    client.publish('/action/imrecog/5f8f2e00c00456e8e03e5e9d',"Sitting", {qos:1});

    console.log("success");


});