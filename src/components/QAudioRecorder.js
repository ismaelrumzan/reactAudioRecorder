import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import AudioRecorder from "audio-recorder-polyfill";
import MicRecorder from "mic-recorder-to-mp3";
import { browserName } from "react-device-detect";
import { osName } from "react-device-detect";
import { deviceType } from "react-device-detect";
import ms from "pretty-ms";

const styles = (theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    width: "100%",
  },
});

const Mp3Recorder = new MicRecorder({ bitRate: 128 });
window.MediaRecorder = AudioRecorder;
let polyRecorder;

class QAudioRecorder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: "",
      loading: false,
      isRecording: false,
      blobAudioURL: "",
      isBlocked: false,
      recordedOnce: false,
      time: 0,
      start: 0,
      blobAudio: {},
    };
  }

  componentDidMount = () => {
    //this.setState({ loading: false });
    const _recAudio = this.props.recordedAudio;
    if (_recAudio !== "") {
      this.setState({ recordedOnce: true, blobAudioURL: _recAudio });
    }
  };

  startPolyfillRec = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      polyRecorder = new MediaRecorder(stream);

      // Set record to <audio> when recording will be finished
      polyRecorder.addEventListener("dataavailable", (e) => {
        console.log(e.data);
        const blobURL = URL.createObjectURL(e.data);
        this.setState({
          blobAudioURL: blobURL,
          isRecording: false,
          recordedOnce: true,
          blobAudio: e.data,
        });
        const returnObj = {
          blobAudioURL: blobURL,
          showSubmitAudio: true,
          blobAudio: e.data,
        };
        this.props.onAudioRecorded(returnObj);
      });

      // Start recording
      polyRecorder.start();
      this.startTimer();
      this.setState({ isRecording: true });
    });
  };

  stopPolyfillRec = () => {
    polyRecorder.stop();
    this.stopTimer();
    // Remove “recording” icon from browser tab
    polyRecorder.stream.getTracks().forEach((i) => i.stop());
  };

  startAudioRec = () => {
    navigator.getUserMedia(
      { audio: true },
      () => {
        console.log("Permission Granted");
        this.startTimer();
        Mp3Recorder.start()
          .then(() => {
            this.setState({ isRecording: true });
          })
          .catch((e) => {
            console.error(e);
            this.setState({ error: "Error recording audio." });
          });
        this.setState({ isBlocked: false });
      },
      () => {
        console.log("Permission Denied");
        this.setState({
          error:
            "Microphone not allowed: Please allow the microphone in the top of your browser.",
        });
        this.setState({ isBlocked: true });
      }
    );
  };

  stopAudioRec = () => {
    this.stopTimer();
    Mp3Recorder.stop()
      .getMp3()
      .then(([buffer, blob]) => {
        const blobURL = URL.createObjectURL(blob);
        this.setState({
          blobAudioURL: blobURL,
          isRecording: false,
          recordedOnce: true,
          blobAudio: blob,
        });
        const returnObj = {
          blobAudioURL: blobURL,
          showSubmitAudio: true,
          blobAudio: blob,
        };
        this.props.onAudioRecorded(returnObj);
      })
      .catch((e) => console.log(e));
  };

  startTimer() {
    this.setState({
      time: 0,
      start: Date.now(),
    });
    this.timer = setInterval(
      () =>
        this.setState({
          time: Date.now() - this.state.start,
        }),
      1
    );
  }

  stopTimer() {
    clearInterval(this.timer);
  }

  selectedAudio = (event) => {
    const blobURL = URL.createObjectURL(event.target.files[0]);
    this.setState({
      blobAudioURL: blobURL,
      isRecording: false,
      recordedOnce: true,
      blobAudio: event.target.files[0],
    });
    const returnObj = {
      blobAudioURL: blobURL,
      showSubmitAudio: true,
      blobAudio: event.target.files[0],
    };
    this.props.onAudioRecorded(returnObj);
  };

  render() {
    const { error } = this.state;
    const { classes } = this.props;

    return (
      <div className="QAudioRecorder">
        {error !== "" && (
          <Box p={1} component="span">
            <h4>{error}</h4>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => this.setState({ error: "" })}
            >
              Reset
            </Button>
          </Box>
        )}
        <Box p={1}>
          {(browserName === "Mobile Safari" && osName === "iOS") ||
          browserName === "Safari" ||
          browserName === "Edge" ||
          (browserName === "Firefox" && osName === "Mac OS") ? (
            <Box>
              <Box p={1} component="span">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => this.startPolyfillRec()}
                  disabled={this.state.isRecording}
                >
                  Record
                </Button>
              </Box>
              <Box p={1} component="span">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => this.stopPolyfillRec()}
                  disabled={!this.state.isRecording}
                >
                  Stop Recording
                </Button>
              </Box>
              {!this.state.isRecording && this.state.recordedOnce && (
                <Box p={1}>
                  <audio src={this.state.blobAudioURL} controls="controls" />
                </Box>
              )}
              {this.state.isRecording && <h3>timer: {ms(this.state.time)}</h3>}
            </Box>
          ) : (deviceType !== "mobile" && browserName === "Chrome") ||
            (deviceType === "mobile" &&
              osName === "Android" &&
              browserName === "Chrome") ? (
            <Box>
              <Box p={1} component="span">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => this.startAudioRec()}
                  disabled={this.state.isRecording}
                >
                  Record
                </Button>
              </Box>
              <Box p={1} component="span">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => this.stopAudioRec()}
                  disabled={!this.state.isRecording}
                >
                  Stop Recording
                </Button>
              </Box>
              {!this.state.isRecording && this.state.recordedOnce && (
                <Box p={1}>
                  <audio src={this.state.blobAudioURL} controls="controls" />
                </Box>
              )}
              {this.state.isRecording && <h3>timer: {ms(this.state.time)}</h3>}
            </Box>
          ) : (deviceType === "mobile" && browserName === "Chrome") ||
            (deviceType === "mobile" && browserName === "Firefox") ? (
            <Box>
              <input
                type="file"
                id="input-file"
                className={classes.input}
                accept="audio/*"
                style={{ display: "none" }}
                capture
                onChange={(event) => this.selectedAudio(event)}
              />
              <label htmlFor="input-file">
                <Button variant="contained" component="span" color="secondary">
                  Access your camera and Record
                </Button>
              </label>
              {this.state.blobAudio !== {} && (
                <Box component="span" p={1}>
                  {this.state.blobAudio.name}
                </Box>
              )}
            </Box>
          ) : (
            <Box>
              <h4>
                Your browser/device is not supported. Please use the File Upload
                Tab.
              </h4>
            </Box>
          )}
        </Box>
      </div>
    );
  }
}

QAudioRecorder.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(QAudioRecorder);
