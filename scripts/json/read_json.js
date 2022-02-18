const fs = require('fs')
var message = fs.readFileSync('RobotRegistration.json');

var student = JSON.parse(message);
var robot = student.RobotRegistration
console.log(student.RobotRegistration.position.x); 