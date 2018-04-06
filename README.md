# react-mic-plus

Record a user's voice and display as an osscilation.

Featured in the course ["How to Write a Single Page Application"](http://www.singlepageapplication.com).

Works via the HTML5 MediaRecorder API ([currently only available in Chrome & Firefox](https://caniuse.com/#search=MediaRecorder)).

## Demo

Check out the [demo](https://hackingbeauty.github.io/react-mic/).

You can also see this component in action at [voicerecordpro.com](https://www.voicerecordpro.com).

## Installation

`npm install --save react-mic-plus`

## Features

- Record audio from microphone
- Display sound wave as voice is being recorded
- Save audio as BLOB

## Usage

```js

<ReactMicPlus
  record={boolean}         // defaults -> false.  Set to true to begin recording
  className={string}       // provide css class name
  onStop={function}        // callback to execute when audio stops recording
  strokeColor={string}     // sound wave color
  backgroundColor={string} // background color
  nonstop={boolean}		   // nonstop specrogram
  duration={integer}	   // duration of spectrogram on the screen (seconds)
/>

```

## Example

```js
import { ReactMicPlus } from 'react-mic-plus';

export class Example extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      record: false
    }

  }

  startRecording = () => {
    this.setState({
      record: true
    });
  }

  stopRecording = () => {
    this.setState({
      record: false
    });
  }

  onStop(recordedBlob) {
    console.log('recordedBlob is: ', recordedBlob);
  }

  render() {
    return (
      <div>
        <ReactMicPlus
          record={this.state.record}
          className="sound-wave"
          onStop={this.onStop}
          strokeColor="#000000"
          backgroundColor="#FF4081"
          nonstop={true}
          duration={5} />
        <button onTouchTap={this.startRecording} type="button">Start</button>
        <button onTouchTap={this.stopRecording} type="button">Stop</button>
      </div>
    );
  }
}
```
# Having issues with the lambda function?
Try installing babel-preset-stage-1

Include stage-1 in your webpack.config under presets.

e.g.

```js
module.exports = {
    entry: "./scripts/Main.js",
    output: {
        path: __dirname,
        filename: "./static/script.js"
    },
    module: {
        loaders: [{
            test: /\.css$/,
            loader: "style!css"
        }, {
            test: /\.js$/,
            // exclude: /(node_modules)/,
            loader: 'babel-loader',
            query: {
                presets: ['es2015', 'react', 'stage-1']
            }
        }]

    }
};
```

## License

MIT



