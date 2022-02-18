const tf = require('@tensorflow/tfjs-node');
const cocoSsd = require('@tensorflow-models/coco-ssd');
const rs2 = require('node-librealsense');

class Camera {
pipeline;
model;
intrinsics;

    async start() {
        this.pipeline = new rs2.Pipeline();
        this.pipeline.start();
        model = await cocoSsd.load();
        let activeProfile = this.pipeline.getActiveProfile().getStreams()[0];
        this.intrinsics = activeProfile.getIntrinsics();
    };

    getTargetPosition() {
        const frameset = this.pipeline.waitForFrames();
        let depthFrame = framset.depthFrame;
        let image = frameset.colorFrame;
        const imgTensor = tf.node.decodeImage(image, 3)    //Check what format the image is
        let predictions = this.model.detect(imgTensor);
        if (predictions.length > 0) {
            predictions = predictions.filter(obj => obj.class == 'person');
            predictions.sort((p1, p2) => {
                if (p1.score > p2.score) {
                    return -1;
                }
                if (p1.score > p2.score) {
                    return 1;
                }
                return 0;
            });
            target = predictions[0];
            let x = target.bbox[0] + (target.bbox[2] / 2);
            let y = target.bbox[1] + (target.bbox[3] / 2);
            let depth = depthFrame.getDistance(x,y);
            coords = rs2.util.deprojectPixelToPoint(this.intrinsics, { x,y }, depth)
            return { x: coords.x, y: coords.z, z: coords.y }
        }
        return false;
    }
}

module.exports = {
Camera
}
