import React, { Component } from "react";
import QAudioRecorder from "../src/components/QAudioRecorder";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      blobAudioURL: "",
      blobAudio: {},
      showSubmitAudio: false,
    };
  }

  getAudio = async (data) => {
    this.setState({
      blobAudioURL: data.blobAudioURL,
      showSubmitAudio: data.showSubmitAudio,
      blobAudio: data.blobAudio,
    });
  };

  render() {
    return (
      <QAudioRecorder
        onAudioRecorded={this.getAudio}
        recordedAudio={this.state.blobAudioURL}
      />
    );
  }
}

export default App;
