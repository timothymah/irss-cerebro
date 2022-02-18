var mqtt = require('mqtt')
const fs = require('fs')

var client = mqtt.connect('mqtt://test.mosquitto.org')

var remotecontrol_topic = 'RemoteControl';
var robotregistration_topic = 'RobotRegistration';
var robottelemetry_topic = 'RobotTelemetry';
var setvelocity_topic = 'SetMaxVelocity';
var route_topic = 'Route';
var setcontrol_topic = 'SetControlMode'
var targetposition_topic = 'TargetPosition'

var robotregistration_message = fs.readFileSync('RobotRegistration.json');
var robottelemetry_message = fs.readFileSync('RobotTelemetry.json');
var targetposition_message = fs.readFileSync('TargetPosition.json');

const remoteControlFunction = (message) => {
    message2 = JSON.stringify(message)
    fs.writeFileSync('RemoteControl.json', message2)
    console.log(message)
};

const setMaxVelocityFunction = (message) => {
    message2 = JSON.stringify(message)
    fs.writeFileSync('SetMaxVelocity.json', message2)
};

const routeFunction = (message) => {
    message2 = JSON.stringify(message)
    fs.writeFileSync('Route.json', message2)
};

const setControlModeFunction = (message) => {
    message2 = JSON.stringify(message)
    fs.writeFileSync('SetControlMode.json', message2)
};

const mqttDispatch = {
    RemoteControl: remoteControlFunction,
    SetMaxVelocity: setMaxVelocityFunction,
    Route: routeFunction,
    SetControlMode: setControlModeFunction
};

client.on('message', (topic, message)=>{
    mqttDispatch[topic](JSON.parse(message));
})

client.on('connect', ()=>{
    client.subscribe(remotecontrol_topic)
    client.subscribe(setvelocity_topic)
    client.subscribe(route_topic)
    client.subscribe(setcontrol_topic)
    setInterval(()=>{
        client.publish(robottelemetry_topic, robottelemetry_message)
        client.publish(targetposition_topic, targetposition_message)
        console.log('Message sent and received!')
    }, 500)
})

