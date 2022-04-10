const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
// TABLE START
document.querySelector('#window-width').innerText = window.innerWidth;
document.querySelector('#window-height').innerText = window.innerHeight;
document.querySelector('#page-width').innerText = document.documentElement.scrollWidth;
document.querySelector('#page-height').innerText = document.documentElement.scrollHeight;
let mouseView = {
  x: document.querySelector('#mouse-x'),
  y: document.querySelector('#mouse-y')
}
let webcamView = {
  x: document.querySelector('#webcam-x'),
  y: document.querySelector('#webcam-y')
};
let predictionView = {
  x: document.querySelector('#prediction-x'),
  y: document.querySelector('#prediction-y')
};
document.body.addEventListener('mousemove', (event) => {
  mouseView.x.innerHTML = event.x;
  mouseView.y.innerHTML = event.y;
});
// TABLE END
// Check whether webcam is supported.
function getUserMediaSupported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}
// If webcam supported, call enableCam function
if (getUserMediaSupported() && !model) {
  const constraints = {
    video: true
  };
  // Activate the webcam video stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    video.srcObject = stream;
    video.addEventListener('loadeddata', predictWebcam);
  });
}
// Store the resulting model in the global scope of our app.
var model = undefined;
// Before we can use COCO-SSD class we must wait for it to finish loading.
// COCO-SSD is an external object loaded from our index.html script tag import.
cocoSsd.load().then(function(loadedModel) {
  model = loadedModel;
  // Show demo section now model is ready to use.
  // demosSection.classList.remove('invisible');
});
var children = [];

function predictWebcam() {
  // Now let's start classifying a frame in the stream.
  model.detect(video).then(function(predictions) {
    // Remove any highlighting we did previous frame.
    for (let i = 0; i < children.length; i++) {
      liveView.removeChild(children[i]);
    }
    children.splice(0);
    // Now lets loop through predictions and draw them to the live view if
    // they have a high confidence score.
    for (let n = 0; n < predictions.length; n++) {
      // If we are over 75% sure we are sure we classified it right, draw it!
      if (predictions[n].score > 0.75) {
        const p = document.createElement('p');
        // p.innerText = predictions[n].class + ' - with ' + predictionConfidence + '% confidence.';
        const prediction = {
          x: window.innerWidth - predictions[n].bbox[0] - video.getBoundingClientRect().x - predictions[n].bbox[2] - 50,
          y: predictions[n].bbox[1],
          w: predictions[n].bbox[2],
          h: predictions[n].bbox[3],
          offset: {
            x: video.getBoundingClientRect().x,
            y: video.getBoundingClientRect().y
          },
          class: predictions[n].class,
          confidence: Math.round(parseFloat(predictions[n].score) * 100)
        };
        p.innerText = '%' + prediction.confidence + ' ' + prediction.class;
        p.style = 'margin-left: ' + prediction.x + 'px;\
                   margin-top: ' + prediction.y + 'px;\
                   width: ' + prediction.w + 'px;\
                   top: 0;\
                   left: 0;';
        const highlighter = document.createElement('div');
        highlighter.setAttribute('class', 'highlighter');
        highlighter.style = 'left: ' + prediction.x + 'px;\
                             top: ' + prediction.y + 'px;\
                             width: ' + prediction.w + 'px;\
                             height: ' + prediction.h + 'px;';
        // TABLE START
        webcamView.x.innerHTML = prediction.offset.x;
        webcamView.y.innerHTML = prediction.offset.y;
        predictionView.x.innerHTML = Math.round(prediction.x);
        predictionView.y.innerHTML = Math.round(prediction.y);
        // TABLE END
        liveView.appendChild(highlighter);
        liveView.appendChild(p);
        children.push(highlighter);
        children.push(p);
      }
    }
    // Call this function again to keep predicting when the browser is ready.
    window.requestAnimationFrame(predictWebcam);
  });
}