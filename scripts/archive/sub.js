var mqtt = require('mqtt')
var client = mqtt.connect('mqtt://test.mosquitto.org')
const fs = require('fs')

var targetposition_topic = 'TargetPosition'

const targetPositionFunction = (message) => {
    message2 = JSON.stringify(message)
    console.log(message2)
    //fs.writeFileSync('SetMaxVelocity.json', message2)
};

const mqttDispatch = {
    TargetPosition: targetPositionFunction,
};

client.on('message', (topic, message)=>{
    mqttDispatch[topic](JSON.parse(message));
})

client.on('connect', ()=>{
    client.subscribe(targetposition_topic)
})