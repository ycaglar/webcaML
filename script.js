const videoFeed = document.getElementById('videoFeed');
const videoFrame = document.getElementById('videoFrame');
// Check whether webcam is supported.
function getUserMediaSupported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}
// If webcam supported, call enableCam function
if (getUserMediaSupported() && !model) {
  const constraints = {
    video: true
  };
  //Activate the webcam video stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    videoFeed.srcObject = stream;
    videoFeed.addEventListener('loadeddata', predictWebcam);
  });
}
// Store the resulting model in the global scope of our app.
var model = undefined;
// Before we can use COCO-SSD class we must wait for it to finish loading.
// COCO-SSD is an external object loaded from our index.html script tag import.
cocoSsd.load().then(function(loadedModel) {
  model = loadedModel;
  // Show demo section now model is ready to use.
});
var children = [];

function predictWebcam() {
  // Now let's start classifying a frame in the stream.
  model.detect(videoFeed).then(function(predictions) {
    // Remove any highlighting we did previous frame.
    for (let i = 0; i < children.length; i++) {
      videoFrame.removeChild(children[i]);
    }
    children.splice(0);
    // Loop through and draw predictions to the live view
    for (let n = 0; n < predictions.length; n++) {
      // If we are over 75% sure we are sure we classified it right, draw it!
      if (predictions[n].score > 0.75) {
        const boundingBoxLabel = document.createElement('p');
        const prediction = {
          x: window.innerWidth - predictions[n].bbox[0] - videoFeed.getBoundingClientRect().x - predictions[n].bbox[2] - 50,
          y: predictions[n].bbox[1],
          w: predictions[n].bbox[2],
          h: predictions[n].bbox[3],
          offset: {
            x: videoFeed.getBoundingClientRect().x,
            y: videoFeed.getBoundingClientRect().y
          },
          class: predictions[n].class,
          confidence: Math.round(parseFloat(predictions[n].score) * 100)
        };
        boundingBoxLabel.innerText = '%' + prediction.confidence + ' ' + prediction.class;
        boundingBoxLabel.style = 'margin-left: ' + prediction.x + 'px;\
                                  margin-top: ' + prediction.y + 'px;\
                                  width: ' + prediction.w + 'px;\
                                  top: 0;\
                                  left: 0;';
        const boundingBox = document.createElement('div');
        boundingBox.setAttribute('class', 'boundingBox');
        boundingBox.style = 'left: ' + prediction.x + 'px;\
                             top: ' + prediction.y + 'px;\
                             width: ' + prediction.w + 'px;\
                             height: ' + prediction.h + 'px;';
        videoFrame.appendChild(boundingBox);
        videoFrame.appendChild(boundingBoxLabel);
        children.push(boundingBox);
        children.push(boundingBoxLabel);
      }
    }
    //keep predicting when the browser is ready.
    window.requestAnimationFrame(predictWebcam);
  });
}