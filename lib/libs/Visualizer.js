let drawVisual;
let shouldDraw;

const Visualizer = {

  visualizeSineWave(analyser, canvasCtx, canvas, width, height, backgroundColor, strokeColor) {
    analyser.fftSize = 2048;

    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    
    canvasCtx.fillStyle = backgroundColor;
    canvasCtx.fillRect(0, 0, width, height);

    function draw() {
      if(!shouldDraw) return;
      
      drawVisual = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      canvasCtx.clearRect(0, 0, width, height);
      canvasCtx.fillStyle = backgroundColor;
      canvasCtx.fillRect(0, 0, width, height);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = strokeColor;

      canvasCtx.beginPath();

      const sliceWidth = width * 1.0 / bufferLength;
      let x = 0;

      for(let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * height/2;

        if(i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height/2);
      canvasCtx.stroke();
    };

    draw();
  },

  visualizeFrequencyBars(analyser, canvasCtx, canvas, width, height, backgroundColor, strokeColor) {
    const self = this;
    analyser.fftSize = 256;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    canvasCtx.fillStyle = backgroundColor;
    canvasCtx.fillRect(0, 0, width, height);

    function draw() {
      if(!shouldDraw) return;
      
      drawVisual = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      canvasCtx.clearRect(0, 0, width, height);
      canvasCtx.fillStyle = backgroundColor;
      canvasCtx.fillRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for(let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        const rgb = self.hexToRgb(strokeColor);

        canvasCtx.fillStyle = strokeColor;
        canvasCtx.fillRect(x,height-barHeight/2,barWidth,barHeight/2);

        x += barWidth + 1;
      }
    };

    draw();
  },

  visualizeFrequencyCircles(analyser, canvasCtx, canvas, width, height, backgroundColor, strokeColor) {
    const self = this;
    analyser.fftSize = 32;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    canvasCtx.beginPath();
    canvasCtx.arc(width / 2, height / 2, Math.min(height, width) / 2, 0, 2 * Math.PI);
    canvasCtx.fillStyle = backgroundColor;
    canvasCtx.fill();

    function draw() {
      if(!shouldDraw) return;
      
      canvasCtx.clearRect(0, 0, width, height);
      drawVisual = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      const reductionAmount = 3;
      const reducedDataArray = new Uint8Array(bufferLength / reductionAmount);
      for (let i = 0; i < bufferLength; i += reductionAmount) {
        let sum = 0;
        for (let j = 0; j < reductionAmount; j++) {
          sum += dataArray[i + j];
        }

        reducedDataArray[i/reductionAmount] = sum / reductionAmount;
      }

      canvasCtx.clearRect(0, 0, width, height);
      canvasCtx.beginPath();
      canvasCtx.arc(width / 2, height / 2, Math.min(height, width) / 2, 0, 2 * Math.PI);
      canvasCtx.fillStyle = backgroundColor;
      canvasCtx.fill();

      const stepSize = (Math.min(height, width) / 2.0) / (reducedDataArray.length);

      canvasCtx.strokeStyle = strokeColor;
      for (let i = 0; i < reducedDataArray.length; i++) {
        canvasCtx.beginPath();
        const normalized = reducedDataArray[i] / 128;
        const r = (stepSize * i) + (stepSize * normalized);
        canvasCtx.arc(width / 2, height / 2, r, 0, 2 * Math.PI);
        canvasCtx.stroke();
      }
    };

    draw();
  },

  visualizeSpectrogram(analyser, canvasCtx, canvas, width, height, backgroundColor, strokeColor, nonstop, duration) {
    const self = this;
    analyser.fftSize = 32;
    analyser.smoothingTimeConstant = 0;
    analyser.maxDecibels = 0;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    canvasCtx.fillStyle = backgroundColor;
    canvasCtx.fillRect(0, 0, width, height);

    let x = 0;
    let pitchSamples = [];

    let timeNow;
    let timeThen;
    let timeDelta;
    
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
      
      let barHeight;
      let speed = (width/duration)*timeDelta;
      let freq = dataArray[bufferLength / 2]
      
      pitchSamples.push({"x": x, "freq": freq});
      
      x += speed;
      if(x >= width){
        shouldDraw = nonstop;

        x -= speed;
        pitchSamples.shift();
        pitchSamples.map(point => point.x -= speed);
      }
      
      for(let i=0; i < pitchSamples.length; i++)
      {
        canvasCtx.fillStyle = strokeColor;
        barHeight = height * pitchSamples[i].freq / 255;
        let ypos = (height/2)-(barHeight/2);
        
        canvasCtx.fillRect(pitchSamples[i].x, ypos, 3, barHeight);
      }
    };

    draw();
  },

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
  },

  shouldDraw(val) {
    shouldDraw = val;
  }

}

export default Visualizer;
