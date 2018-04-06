function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// cool blog article on how to do this: http://www.smartjava.org/content/exploring-html5-web-audio-visualizing-sound
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API

// distortion curve for the waveshaper, thanks to Kevin Ennis
// http://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion

import React, { Component } from 'react';
import { string, number, bool, func } from 'prop-types';
import { MicrophoneRecorder } from '../libs/MicrophoneRecorder';
import AudioContext from '../libs/AudioContext';
import AudioPlayer from '../libs/AudioPlayer';
import Visualizer from '../libs/Visualizer';

var ReactMicPlus = function (_Component) {
  _inherits(ReactMicPlus, _Component);

  function ReactMicPlus(props) {
    _classCallCheck(this, ReactMicPlus);

    var _this = _possibleConstructorReturn(this, _Component.call(this, props));

    _this.visualize = function (record) {
      var self = _this;
      var _this$props = _this.props,
          backgroundColor = _this$props.backgroundColor,
          strokeColor = _this$props.strokeColor,
          width = _this$props.width,
          height = _this$props.height,
          visualSetting = _this$props.visualSetting,
          nonstop = _this$props.nonstop,
          duration = _this$props.duration;
      var _this$state = _this.state,
          canvas = _this$state.canvas,
          canvasCtx = _this$state.canvasCtx,
          analyser = _this$state.analyser;

      Visualizer.shouldDraw(record);

      if (visualSetting === 'sinewave') {
        Visualizer.visualizeSineWave(analyser, canvasCtx, canvas, width, height, backgroundColor, strokeColor);
      } else if (visualSetting === 'frequencyBars') {
        Visualizer.visualizeFrequencyBars(analyser, canvasCtx, canvas, width, height, backgroundColor, strokeColor);
      } else if(visualSetting === 'spectrogram') {
        Visualizer.visualizeSpectrogram(analyser, canvasCtx, canvas, width, height, backgroundColor, strokeColor, nonstop, duration);
      }
    };

    _this.state = {
      analyser: null,
      microphoneRecorder: null,
      canvas: null,
      canvasCtx: null
    };
    return _this;
  }

  ReactMicPlus.prototype.componentDidMount = function componentDidMount() {
    var _this2 = this;

    var _props = this.props,
        onStop = _props.onStop,
        onStart = _props.onStart,
        audioElem = _props.audioElem,
        audioBitsPerSecond = _props.audioBitsPerSecond,
        mimeType = _props.mimeType;
    var visualizer = this.refs.visualizer;

    var canvas = visualizer;
    var canvasCtx = canvas.getContext("2d");
    var options = {
      audioBitsPerSecond: audioBitsPerSecond,
      mimeType: mimeType
    };

    if (audioElem) {
      var analyser = AudioContext.getAnalyser();

      AudioPlayer.create(audioElem);

      this.setState({
        analyser: analyser,
        canvas: canvas,
        canvasCtx: canvasCtx
      }, function () {
        _this2.visualize(true);
      });
    } else {
      var _analyser = AudioContext.getAnalyser();

      this.setState({
        analyser: _analyser,
        microphoneRecorder: new MicrophoneRecorder(onStart, onStop, options),
        canvas: canvas,
        canvasCtx: canvasCtx
      }, function () {
        _this2.visualize(false);
      });
    }
  };

  ReactMicPlus.prototype.render = function render() {
    var _props2 = this.props,
        record = _props2.record,
        onStop = _props2.onStop,
        width = _props2.width,
        height = _props2.height;
    var _state2 = this.state,
        analyser = _state2.analyser,
        microphoneRecorder = _state2.microphoneRecorder,
        canvasCtx = _state2.canvasCtx;


    if (record) {
      if (microphoneRecorder) {
        microphoneRecorder.startRecording();
        this.visualize(true);
      }
    } else {
      if (microphoneRecorder) {
        microphoneRecorder.stopRecording(onStop);
        Visualizer.shouldDraw(false);
      }
    }

    return React.createElement('canvas', { ref: 'visualizer', height: height, width: width, className: this.props.className });
  };

  return ReactMicPlus;
}(Component);

export { ReactMicPlus as default };


ReactMicPlus.propTypes = process.env.NODE_ENV !== "production" ? {
  backgroundColor: string,
  strokeColor: string,
  className: string,
  audioBitsPerSecond: number,
  mimeType: string,
  height: number,
  record: bool.isRequired,
  onStop: func
} : {};

ReactMicPlus.defaultProps = {
  backgroundColor: 'rgba(255, 255, 255, 0.5)',
  strokeColor: '#000000',
  className: 'visualizer',
  audioBitsPerSecond: 128000,
  mimeType: 'audio/webm;codecs=opus',
  record: false,
  width: 640,
  height: 100,
  visualSetting: 'sinewave',
  nonstop: true,
  duration: 5
};
