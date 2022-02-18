'use strict';
/**
 * This example demonstrates simple receiving of messages over the ROS system.
 */

// Require rosnodejs itself
const rosnodejs = require('rosnodejs');
const fs = require('fs');
// Requires the std_msgs message package
const std_msgs = rosnodejs.require('std_msgs').msg;
const Twist = rosnodejs.require('geometry_msgs').msg.Twist;


const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT || 3001;
const index = require("./routes/index");
const { response } = require("express");

const app = express();
app.use(cors())
app.use(index);

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: '*'
  }
});

let interval;

io.on("connection", (socket) => {
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => getApiAndEmit(socket), 1000);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

const getApiAndEmit = socket => {
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
  
  const registration = [
    {
      sensorId: 1, 
      sensorType: "EO", 
      xyFloor: [1,2,3], 
      sensor: "EO"
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

  const localisation = [
    {
      robotId: 1, 
      robotModel: "BD", 
      xyFloor: [1,2,3], 
      vxvy: [1,1] 
    }
  ]

  const sensorTelemetry = [
    {
      robotId: 1, 
      robotModel: "BD", 
      sensorId: 12344321, 
      sensorType: "EO", 
      // sensorData: {FOV: 45, Zoom: 2, PanAngle: 20, TiltAngle: 30}
    }
  ]

  telemetry.forEach((response) => {
    socket.emit("SensorTelemetry", response)
  });
  registration.forEach((response) => {
    socket.emit("SensorRegistration", response)
  });
  robotRegistration.forEach((response) => {
    socket.emit("RobotRegistration", response)
  });
  localisation.forEach((response) => {
    socket.emit("RobotLocalisation", response)
  });
  sensorTelemetry.forEach((response) => {
    socket.emit("RobotSensorTelemetry", response)
  });


};

const global_data = 0;
function cerebro_subscriber() {
  // Register node with ROS master
  rosnodejs.initNode('/cerebro_subscriber')
    .then((rosNode) => {
      // Create ROS subscriber on the 'cmd_vel' topic
      let sub = rosNode.subscribe('/cmd_vel', Twist,
        (data) => { // define callback execution
          // console.log('I heard: [' + data.linear.x + ']');
          // const message = JSON.stringify({
          //   vxvy: [data.linear.x , data.linear.y]
          // })
          // fs.writeFileSync('test.json', message);
          var message = fs.readFileSync('RobotRegistration.json');
          var robotRegistration = JSON.parse(message);
          robotRegistration.RobotRegistration.position.x = data.linear.x;
          var json_message = JSON.stringify(robotRegistration);
          fs.writeFileSync('test.json', json_message);
        }
      )
    });
}

if (require.main === module) {
  // Invoke Main Listener Function
  cerebro_subscriber();
}

server.listen(port, () => console.log(`Listening on port ${port}`));