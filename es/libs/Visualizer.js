var drawVisual = void 0;
var shouldDraw = void 0;

var Visualizer = {
  visualizeSineWave: function visualizeSineWave(analyser, canvasCtx, canvas, width, height, backgroundColor, strokeColor) {
    analyser.fftSize = 2048;

    var bufferLength = analyser.fftSize;
    var dataArray = new Uint8Array(bufferLength);

    canvasCtx.clearRect(0, 0, width, height);

    function draw() {

      drawVisual = requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = backgroundColor;
      canvasCtx.fillRect(0, 0, width, height);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = strokeColor;

      canvasCtx.beginPath();

      var sliceWidth = width * 1.0 / bufferLength;
      var x = 0;

      for (var i = 0; i < bufferLength; i++) {
        var v = dataArray[i] / 128.0;
        var y = v * height / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };

    draw();
  },
  visualizeFrequencyBars: function visualizeFrequencyBars(analyser, canvasCtx, canvas, width, height, backgroundColor, strokeColor) {
    var self = this;
    analyser.fftSize = 256;

    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);

    canvasCtx.clearRect(0, 0, width, height);

    function draw() {
      drawVisual = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      canvasCtx.fillStyle = backgroundColor;
      canvasCtx.fillRect(0, 0, width, height);

      var barWidth = width / bufferLength * 2.5;
      var barHeight = void 0;
      var x = 0;

      for (var i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        var rgb = self.hexToRgb(strokeColor);

        // canvasCtx.fillStyle = `rgb(${barHeight+100},${rgb.g},${rgb.b})`;
        canvasCtx.fillStyle = strokeColor;
        canvasCtx.fillRect(x, height - barHeight / 2, barWidth, barHeight / 2);

        x += barWidth + 1;
      }
    };

    draw();
  },
  visualizeSpectrogram: function visualizeSpectrogram(analyser, canvasCtx, canvas, width, height, backgroundColor, strokeColor, nonstop, duration) {
    var self = this;
    analyser.fftSize = 32;
    analyser.smoothingTimeConstant = 0;
    analyser.maxDecibels = 0;

    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);

    canvasCtx.fillStyle = backgroundColor;
    canvasCtx.fillRect(0, 0, width, height);

    var x = 0;
    var pitchSamples = [];

    var timeNow;
    var timeThen;
    var timeDelta;

    function draw() {
      if(!shouldDraw) return;

      drawVisual = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      canvasCtx.clearRect(0, 0, width, height);
      canvasCtx.fillStyle = backgroundColor;
      canvasCtx.fillRect(0, 0, width, height);

      timeNow = Date.now();
      if(typeof timeThen == "undefined")
        timeThen = timeNow;
      timeDelta = (timeNow - timeThen) / 1000;
      timeThen = timeNow;

      
      var barHeight;
      var speed = (width/duration)*timeDelta;
      var freq = dataArray[bufferLength / 2];
      
      pitchSamples.push({"x": x, "freq": freq});

      x += speed;
      if(x >= width){
        shouldDraw = nonstop;
        
        x -= speed;
        pitchSamples.shift();
        pitchSamples.map(function(point) {
          return point.x -= speed;
        });
      }
      
      for(var i=0; i < pitchSamples.length; i++)
      {
        canvasCtx.fillStyle = strokeColor;
        barHeight = height * pitchSamples[i].freq / 255;
        var ypos = (height/2)-(barHeight/2);
        
        canvasCtx.fillRect(pitchSamples[i].x, ypos, 3, barHeight);
      }
    };

    draw();
  },
  hexToRgb: function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },
  shouldDraw: function(val) {
    shouldDraw = val;
  }
};

export default Visualizer;