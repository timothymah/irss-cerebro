var mqtt = require('mqtt')
const fs = require('fs')

var client = mqtt.connect('mqtt://localhost:1234')
var topic = 'Telemetry'
var message = fs.readFileSync('test.json');

client.on('connect', ()=>{
    setInterval(()=>{
        client.publish(topic, message)
        console.log('Message sent!', message)
    }, 5000)
})

const telemetry = [
      {
        sensorId: 12344321, 
        sensorType: "EO", 
        sensorData: {
            fov: 45, 
            zoom: 2, 
            panAngle: 20, 
            tiltAngle: 30
        }
      }
    ]  


const robotRegistration = [
{
      robotId: 1, 
      robotModel: "BD", 
      xyFloor: [1,2,3], 
      sensor: ["EO", "Lidar"]
}
]

const registration = [
      {
        sensorId: 1, 
        sensorType: "EO", 
        xyFloor: [1,2,3], 
        sensor: "EO"
      }
    ]

    const localisation = [
      {
        robotId: 1, 
        robotModel: "BD", 
        xyFloor: [1,2,3], 
        vxvy: [1,1] 
      }
    ]