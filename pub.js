
var mqtt = require('mqtt')
var client  = mqtt.connect('tcp://192.168.1.36:1883')
 
client.on('connect', function(){

    // var pubs ={
    //     "patient": "Timin Suprapti",
    //     "urgent" : "To Much Sitting"
    // }
    // client.publish('/notification/lulus3355',JSON.stringify(pubs), {qos:1});

    var pubs ={
        "image": "aaaa",
        "imrecog" : "Standing"
    }

    client.publish('/action/image',JSON.stringify(pubs), {qos:1});
    client.publish('/action/imrecog/5f8f2dd0c00456e8e03e5e9c',"Standing", {qos:1});
    const timepub = new Date()
    timepub.setHours( timepub.getHours() + 7 );
    console.log(timepub.toISOString())
    console.log("success");


});
