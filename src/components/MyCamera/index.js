'use strict';
import React, { Component } from 'react';
import { TouchableOpacity, View, Image, Slider, Text, Linking, Dimensions, CameraRoll, AppState } from 'react-native';
import Camera from 'react-native-camera';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from './../../actions';
import RNVideoEditor from 'react-native-video-editor';
import { ProcessingManager } from 'react-native-video-processing';
import Orientation from 'react-native-orientation';
import KeepAwake from 'react-native-keep-awake';
import Toast from 'react-native-root-toast';

const FileOpener = require('react-native-file-opener');

var RNFS = require('react-native-fs');

const styles = require('./style');

var nextVidPath = null, previousVidPath = null, clippedVidPath, myTimer, saveClip, restart, betweenStopAndStart;

class MyCamera extends Component {

  constructor(props) {
    super(props);
    const { width, height } = Dimensions.get('window');
    const initial = Orientation.getInitialOrientation();
    this.props.updateOrientation(initial, width, height);
    this.camera = null;
  }

  componentDidUpdate() {
    if (this.props.isRecording) {
      if (this.props.orientation == 'PORTRAIT'){
        Orientation.lockToPortrait();
      }
      else {
        Orientation.lockToLandscape();
      }
    }
    else {
      Orientation.unlockAllOrientations();
    }
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    Orientation.addOrientationListener(this._orientationDidChange);
  }

  componentWillUnmount() {
    // Remember to remove listener
    AppState.removeEventListener('change', this._handleAppStateChange);
    Orientation.removeOrientationListener(this._orientationDidChange);
  }

  _orientationDidChange = (orientation) => {
    const { width, height } = Dimensions.get('window');
    this.props.updateOrientation(orientation, width, height);
  }

  _handleAppStateChange = (nextAppState) => {
    if ( nextAppState === 'background') {
      console.log('App has went to the background!')
      this.stopRecord();
    }
  }

  toast = () => {
    Toast.show('Video Saved', {
      duration: Toast.durations.LONG,
      position: Toast.positions.CENTER,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0,
      onShow: () => {
          // calls on toast\`s appear animation start
      },
      onShown: () => {
          // calls on toast\`s appear animation end.
      },
      onHide: () => {
          // calls on toast\`s hide animation start.
      },
      onHidden: () => {
          // calls on toast\`s hide animation end.
      }
    });
  }

  cameraManager(proceed) {
    if (proceed){
      if (this.camera) {
        const options = {};
        betweenStopAndStart = false;
        this.camera.capture({metadata: options})
          .then((data) => {
            if (saveClip) {
              this.deleteFile(previousVidPath);
              previousVidPath = nextVidPath;
              nextVidPath = data.path;
              this.determineClippingAction(previousVidPath, nextVidPath);
            }
            else {
              this.deleteFile(previousVidPath);
              previousVidPath = nextVidPath;
              nextVidPath = data.path;
            }

            if (restart) {
              this.cameraManager(true);
            }
            else{
              this.stopCleanup();
            }
          })
          .catch(err => console.error(err));

        this.timer();
      }
    }
    else {
      this.camera.stopCapture();
    }
  }

  startRecord() {
    this.cameraManager(true);
    this.props.recordStatusChange(true);
  }

  stopRecord() {
    if(this.camera){
      restart = false;
      saveClip = false;
      clearTimeout(myTimer);
      this.cameraManager(false);
      this.props.recordStatusChange(false);
    }
  }

  stopCleanup() {
    this.deleteFile(previousVidPath);
    this.deleteFile(nextVidPath);
    previousVidPath = null;
    nextVidPath = null;
    clippedVidPath = null;
  }

  timer() {
    myTimer = setTimeout(() => {
      saveClip = false;
      restart = true;
      this.camera.stopCapture();
      betweenStopAndStart = true;
    }, this.props.recordTime * 2 * 1000);
  }

  reverseCamera() {
    if(this.props.isRecording){
      this.stopRecord();
    }
    this.props.reverseCamera();
  }

  openPhotos() {
    const FileMimeType = "video/mp4"; // mime type of the file
    FileOpener.open(
        this.props.previousVid,
        FileMimeType
    ).then((msg) => {
        console.log('success!!')
    },() => {
        console.log('error!!')
    });
  }

  saveClip() {
    if(!betweenStopAndStart){
      saveClip = true;
      restart = true;
      clearTimeout(myTimer);
      this.camera.stopCapture();
    }
    else {
      console.log('missed the camera trying again');
      setTimeout(() => {
      this.saveClip();
    }, 200);
    }
  }

  determineClippingAction(previousVidPath, nextVidPath) {
    ProcessingManager.getVideoInfo(nextVidPath)
      .then(({ duration }) => {
        const durationEarly = duration - .6;
        const durationLate = duration + .6;

        if(duration == 0 && previousVidPath != null){
          console.log("case 1: new vid duraction = 0");
          this.clipVideoLength(this.props.recordTime, this.props.recordTime * 2, previousVidPath, false, previousVidPath, nextVidPath);
        }
        else if(previousVidPath != null && duration < this.props.recordTime) {
          //clip previous and join with next
          console.log("case 2: new vid duration is less than record time");
          this.clipVideoLength(this.props.recordTime * 2 - durationLate, this.props.recordTime * 2, previousVidPath, true, previousVidPath, nextVidPath);
        }
        else if (duration > this.props.recordTime){
          //drop previous, cut and save next
          console.log("case 3: new vid duration is greater than record time");
          this.clipVideoLength(durationEarly - this.props.recordTime, duration, nextVidPath, false, previousVidPath, nextVidPath);
        }
        else if((previousVidPath == null && duration < this.props.recordTime) || duration == this.props.recordTime) {//will probably need to make some delta comparison due to double
          //save next
          console.log("case 4: no previous vid and duration is less than record time");
           CameraRoll.saveToCameraRoll(nextVidPath, 'video').then((value) => {
              this.props.previousVidChange(value);
              this.toast();
            }).catch((e) => {
              console.log(e);
            });
        }
      });
  }

  joinVideos(clippedVidPath, previousVidPath, nextVidPath) {
    RNVideoEditor.merge(
      [clippedVidPath, nextVidPath],
      (results) => {
        alert('Error: ' + results);
      },
      (results, file) => {
        this.props.previousVidChange(file);
        this.toast();
        CameraRoll.saveToCameraRoll(file, 'video').then((value) => {
        }).catch((e) => {
          console.log(e);
        });
        this.deleteFile(previousVidPath);
        this.deleteFile(nextVidPath);
        this.deleteFile(clippedVidPath);  
      }
    );
  }

  clipVideoLength(startTime, endTime, source, join, previousVidPath, nextVidPath) {
    const options = {
        startTime: startTime,
        endTime: endTime,
        // saveToCameraRoll: true, // default is false // iOS only
        // saveWithCurrentDate: true, // default is false // iOS only
    };

    ProcessingManager.trim(source, options) // like VideoPlayer trim options
          .then((data) => {
            clippedVidPath = data;
            if (join){
              this.joinVideos(clippedVidPath, previousVidPath, nextVidPath);
            }
            else{
              this.deleteFile(previousVidPath);
              this.deleteFile(nextVidPath);
              this.props.previousVidChange(clippedVidPath);
              this.toast();
              // CameraRoll.saveToCameraRoll(data.path, 'video').then((value) => {
              //  console.log(value);
              // }).catch((e) => {
              //  console.log(e);
              // });
            }
          })
          .catch((err) => {
            console.log(err.message);
          });
  }

  deleteFile(filepath) {
    if (filepath != null) {
      RNFS.exists(filepath)
      .then( (result) => {

          if(result){
            return RNFS.unlink(filepath)
              .then(() => {
                // console.log('FILE DELETED: ' + filepath);
              })
              // `unlink` will throw an error, if the item to unlink does not exist
              .catch((err) => {
                console.log(err.message);
              });
          }

        })
        .catch((err) => {
          console.log(err.message);
        });
      }
  }

  _renderCameraTrue() {
    return (
      <View style={styles.innerContainer}>
        <View style={[styles.buttonContainer, {width:this.props.width}]}>
          <ShowVid />
          <ControlButton onPressHandler={this.saveClip.bind(this)} imageSource={require('./saveClip.png')} />
          <ControlButton onPressHandler={this.stopRecord.bind(this)} imageSource={require('./stopRec.png')} />
          <KeepAwake />
        </View>
      </View>
    );
  }

  _renderCameraFalse() {
    return (
      <View style={styles.innerContainer}>
        <View style={styles.timeContainer}>
          <Text style={styles.recordTime}>
            {this.props.recordTime}s
          </Text>
        </View>
        <View style={styles.sliderContainer}>
          <HistoryBar style={styles.slider} height={this.props.height * .1} updateMethod={this.props.updateRecordTime} recordTime={this.props.recordTime} />
        </View>
        <View style={[styles.buttonContainer, {width:this.props.width}]}>
          <ShowVid previousVid= {this.props.previousVid} showVids= {this.openPhotos.bind(this)} />
          <ControlButton onPressHandler={this.startRecord.bind(this)} imageSource={require('./record.png')} />
          <ControlButton onPressHandler={this.reverseCamera.bind(this)} imageSource={require('./reverseCamera.png')} />
        </View>
      </View>
    );
  }

  _renderCameraBody() {
    if (this.props.isRecording) {
      return this._renderCameraTrue();
    } else {
      return this._renderCameraFalse();
    }
  }

  render() {
    const { isRecording, previousVid, cameraBack, recordTime, updateRecordTime, orientation } = this.props;
    const cameraDirection = cameraBack ? Camera.constants.Type.back : Camera.constants.Type.front;
    return (
      <View style={styles.wholeContainer}>
        <Camera style={{flex: 1}}
          ref={cam => this.camera=cam}
          aspect={Camera.constants.Aspect.fill}
          captureMode={Camera.constants.CaptureMode.video}
          // captureQuality={Camera.constants.CaptureQuality["1080p"]}
          // captureTarget={Camera.constants.CaptureTarget.disk}
          keepAwake={true}
          type={cameraDirection}
          audio={true} />
      <View>
        {this._renderCameraBody()}
      </View>
      </View>
    );
  }
}

const ShowVid = ({previousVid, showVids}) => {
  const vidFile = "file:///" + previousVid
  console.log("show this vid: " + vidFile);
  if (previousVid) {
    return (
      <ControlButton onPressHandler={showVids} imageSource={{uri: vidFile}} />
    );
  }
  else {
    return (
      <View style={{width: 90, height: 90}} />
    );
  }
};

const ControlButton = ({ onPressHandler, imageSource }) => {
  return (
    <TouchableOpacity onPress={onPressHandler}>
      <Image
        style={styles.recordButton}
        source={imageSource}
      />
    </TouchableOpacity>
  );
};

const HistoryBar = ({ style, updateMethod, recordTime, height }) => {
  return(
    <Slider
      disabled={false}
      maximumValue={60}
      minimumValue={5}
      onValueChange= {(value) => updateMethod(value)}
      step={5}
      style={[style, {height:height}]}
      value={recordTime} />
  );
};

const mapStateToProps = (state) => { 
  return {
    isRecording: state.cameraState.isRecording, 
    previousVid: state.cameraState.previousVid,
    cameraBack: state.cameraState.cameraBack,
    recordTime: state.cameraState.recordTime,
    orientation: state.cameraState.orientation,
    width: state.cameraState.width,
    height: state.cameraState.height,
  };
};

const mapDispatchToProps = (dispatch) => {  
  return bindActionCreators(Actions, dispatch);
};
// function mapDispatchToProps(dispatch) { return bindActionCreators(Actions, dispatch); }

export default connect(mapStateToProps, mapDispatchToProps)(MyCamera);