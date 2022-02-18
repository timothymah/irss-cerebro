'use strict';
// var { Camera } = require('./realsense.js'); 
// const camera = new Camera();

// Require rosnodejs itself
const rosnodejs = require('rosnodejs');
const fs = require('fs');
// Requires the std_msgs message package
const std_msgs = rosnodejs.require('std_msgs').msg;
const Twist = rosnodejs.require('geometry_msgs').msg.Twist;
const PoseStamped = rosnodejs.require('geometry_msgs').msg.PoseStamped;
const PoseWithCovarianceStamped = rosnodejs.require('geometry_msgs').msg.PoseWithCovarianceStamped;
//quat2euler
var qte= require('quaternion-to-euler');

function cerebro() {
  // Register node with ROS master
  rosnodejs.initNode('/cerebro')
    .then((rosNode) => {
      // Create ROS subscriber on the 'cmd_vel' topic
      let sub_robotregistration = rosNode.subscribe('/cmd_vel', Twist,
        (data) => { // define callback execution
          var message = fs.readFileSync('RobotRegistration.json');
          var robotRegistration = JSON.parse(message);
          robotRegistration.position.x = data.linear.x;
          robotRegistration.position.y = data.linear.y;
          var json_message = JSON.stringify(robotRegistration);
          fs.writeFileSync('RobotRegistration.json', json_message);
        }
      )

      let sub_robottelemetry_vel = rosNode.subscribe('/cmd_vel', Twist,
      (data) => { // define callback execution
        var message = fs.readFileSync('RobotTelemetry.json');
        var robotRobotTelemetry = JSON.parse(message);
        robotRobotTelemetry.localisation.velocity.vx = data.linear.x;
        robotRobotTelemetry.localisation.velocity.vy = data.linear.y;
        var json_message = JSON.stringify(robotRobotTelemetry);
        fs.writeFileSync('RobotTelemetry.json', json_message);
        }
      )

      let sub_robottelemetry_pose = rosNode.subscribe('/amcl_pose', PoseWithCovarianceStamped,
      (data) => { // define callback execution
        var message = fs.readFileSync('RobotTelemetry.json');
        var robotRobotTelemetry = JSON.parse(message);
        robotRobotTelemetry.localisation.position.x = data.pose.pose.position.x;
        robotRobotTelemetry.localisation.position.y = data.pose.pose.position.y;
        robotRobotTelemetry.localisation.position.yaw = data.pose.pose.orientation.z;
        var json_message = JSON.stringify(robotRobotTelemetry);
        fs.writeFileSync('RobotTelemetry.json', json_message);
        }
      )

      let sub_targetposition = rosNode.subscribe('/amcl_pose', PoseWithCovarianceStamped,
      (data) => { // define callback execution
        var message = fs.readFileSync('TargetPosition.json');
        var TargetPosition = JSON.parse(message);

        var quaternion = [
          data.pose.pose.orientation.x,
          data.pose.pose.orientation.y,
          data.pose.pose.orientation.z,
          data.pose.pose.orientation.w
        ];
        var euler = qte(quaternion);

        TargetPosition.robotPos.x = data.pose.pose.position.x;
        TargetPosition.robotPos.y = data.pose.pose.position.y;
        TargetPosition.robotPos.z = data.pose.pose.position.z;
        TargetPosition.robotPos.theta = euler[0];
        
        var json_message = JSON.stringify(TargetPosition);
        fs.writeFileSync('TargetPosition.json', json_message);
        }
      )

      // let pub = rosNode.advertise('/move_base_simple/goal', PoseStamped);
      // const msg = new PoseStamped(); 
      // setInterval(() => {
      //   // Construct the message
      //   var message_controlmode = fs.readFileSync('SetControlMode.json');
      //   var robotControlMode = JSON.parse(message_controlmode)
      //   if (robotControlMode.waypointMode == true) {
      //     var message = fs.readFileSync('Route.json');
      //     var robotWaypoint = JSON.parse(message);
      //     msg.header.frame_id = "map";
      //     msg.pose.position.x = robotWaypoint.x; 
      //     msg.pose.position.y = robotWaypoint.y;
      //     msg.pose.orientation.z= 0.74;
      //     msg.pose.orientation.w= 0.98;
      //     // Publish over ROS
      //     pub.publish(msg);
      //   }
      // }, 1000);
      

      let pub2 = rosNode.advertise('/cmd_vel', Twist);
      const msg2 = new Twist();
      // Define a function to execute every 100ms
      setInterval(() => {
        var message_controlmode = fs.readFileSync('SetControlMode.json');
        var robotControlMode = JSON.parse(message_controlmode)
        if (robotControlMode.waypointMode == false) {
          // Construct the message
          var message = fs.readFileSync('RemoteControl.json');
          var message2 = fs.readFileSync('SetMaxVelocity.json');
          var robotRemoteControl = JSON.parse(message);
          var robotMaxVelocity = JSON.parse(message2);
          msg2.linear.x = robotMaxVelocity.linear * robotRemoteControl.longitudinal;
          msg2.linear.y = robotMaxVelocity.linear * robotRemoteControl.lateral;
          msg2.linear.z = robotMaxVelocity.linear * robotRemoteControl.vertical;
          msg2.angular.x = robotMaxVelocity.rotation * robotRemoteControl.roll;
          msg2.angular.y = robotMaxVelocity.rotation * robotRemoteControl.pitch;
          msg2.angular.z = robotMaxVelocity.rotation * robotRemoteControl.yaw;            
          
          pub2.publish(msg2);
          console.log(msg2);
        }
      }, 1000);
      
  });
}


if (require.main === module) {
  // Invoke Main Listener Function
  cerebro()
  // targetPosition = camera.getTargetPosition();
}

