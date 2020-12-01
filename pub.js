  
var mqtt = require('mqtt')
var client  = mqtt.connect('tcp://x2.hcm-lab.id:1883')
 
client.on('connect', function(){

    var pubs ={
        "image": "aaaaaaaa",
        "imrecog" : "Standing"
    }
    client.publish('/action/image',JSON.stringify(pubs), {qos:1});
    client.publish('/action/imrecog/aa',"Sitting", {qos:1});

    console.log("success");


});