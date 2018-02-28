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

var nextVidPath = null, previousVidPath = null, myTimer, saveClip, restart, betweenStopAndStart;

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

  _orientationDidChange = (orientation) => {
    const { width, height } = Dimensions.get('window');
    this.props.updateOrientation(orientation, width, height);
  }

  _handleAppStateChange = (nextAppState) => {
    if ( nextAppState === 'background') {
      AppState.removeEventListener('change', this._handleAppStateChange);
      Orientation.removeOrientationListener(this._orientationDidChange);
      clearTimeout(myTimer);
      this.stopRecord();
      this.props.previewChange(false);
      //I might need to exit the app here as well but that will be ugly
    }

    if (nextAppState === 'active') {
      AppState.addEventListener('change', this._handleAppStateChange);
      Orientation.addOrientationListener(this._orientationDidChange);
      this.props.previewChange(true);
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
      setTimeout(() => {
        restart = false;
        saveClip = false;
        clearTimeout(myTimer);
        this.cameraManager(false);
        this.props.recordStatusChange(false);
      },1);
    }
  }

  stopCleanup() {
    console.log("deleting previousVidPath: " + previousVidPath);
    this.deleteFile(previousVidPath);
    console.log("deleting nextVidPath: " + nextVidPath);
    this.deleteFile(nextVidPath);
    previousVidPath = null;
    nextVidPath = null;
    clearTimeout(myTimer);
  }

  timer() {
    myTimer = setTimeout(() => {
      saveClip = false;
      restart = true;
      this.camera.stopCapture();
      betweenStopAndStart = true;
    }, this.props.recordTime * 2.2 * 1000);
  }

  reverseCamera() {
    if(this.props.isRecording){
      this.stopRecord();
    }
    this.props.reverseCamera();
  }

  openPhotos() {
    const FileMimeType = "video/mp4"; // mime type of the file
    const file = this.props.previousVid.replace("file://", "");
    FileOpener.open(
        file,
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

  determineClippingAction(previousVid, nextVid) {
    setTimeout(() => {
      ProcessingManager.getVideoInfo(nextVid)
      .then(({ duration }) => {
        const durationEarly = duration - 1;
        const durationLate = duration + .7;

        if(durationLate <= 1 && previousVid != null){
          console.log("case 1: new vid duraction = 0");
          this.clipVideoLength(this.props.recordTime, (this.props.recordTime * 2.2), previousVid, false, previousVid, nextVid);
        }
        else if(previousVid != null && duration < this.props.recordTime) {
          //clip previous and join with next
          console.log("case 2: new vid duration is less than record time");
          this.clipVideoLength(this.props.recordTime + duration * 1.5, this.props.recordTime * 2.2, previousVid, true, previousVid, nextVid);
        }
        else if (duration > this.props.recordTime){
          //drop previous, cut and save next
          console.log("case 3: new vid duration is greater than record time");
          this.clipVideoLength(durationEarly - this.props.recordTime, duration, nextVid, false, previousVid, nextVid);
        }
        else if((previousVid == null && duration < this.props.recordTime) || duration == this.props.recordTime) {//will probably need to make some delta comparison due to double
          //save next
          console.log("case 4: no previous vid and duration is less than record time");
           CameraRoll.saveToCameraRoll(nextVid, 'video').then((value) => {
              this.props.previousVidChange(this.getFileUri(nextVid.replace("file://", "")));
              this.deleteFile(nextVid);
              this.toast();
            }).catch((e) => {
              console.log(e);
            });
        }
      });
    }, 1);
  }

  getFileUri(videoPathTemp) {
    if (videoPathTemp.indexOf(RNFS.ExternalStorageDirectoryPath) == -1) {
      const position = videoPathTemp.lastIndexOf("/");
      const fileName = videoPathTemp.slice(position, videoPathTemp.length);
      return "file://" + RNFS.ExternalStorageDirectoryPath + "/DCIM" + fileName;
    }
    return "file://" + videoPathTemp.replace("Movies", "DCIM");//I have a feeling that this will be android only solution
  }

  joinVideos(clippedVidPath, previousVid, nextVid) {
    // ProcessingManager.getVideoInfo(nextVid)
    //   .then(({ duration }) => {
    //     console.log("nextvid length: " + duration);
    //   });

    // ProcessingManager.getVideoInfo(clippedVidPath)
    //   .then(({ duration }) => {
    //     console.log("clippedVid length: " + duration);
    //   });

    RNVideoEditor.merge(
      [clippedVidPath, nextVid],
      (results) => {
        alert('Error: ' + results);
      },
      (results, file) => {
        CameraRoll.saveToCameraRoll(file, 'video').then((value) => {
          this.props.previousVidChange(this.getFileUri(file));
          this.deleteFile(file);
          this.toast();
        }).catch((e) => {
          console.log(e);
        });
        this.deleteFile(previousVid);
        this.deleteFile(nextVid);
        this.deleteFile(clippedVidPath);  
      }
    );
  }

  clipVideoLength(startTime, endTime, source, join, previousVid, nextVid) {
    const options = {
        startTime: startTime,
        endTime: endTime,
    };

    // ProcessingManager.getVideoInfo(source)
    //   .then(({ duration }) => {
    //     console.log("source length: " + duration);
    //     console.log("startTime: " + startTime);
    //     console.log("endTime: " + endTime);
    //   });

    ProcessingManager.trim(source, options) // like VideoPlayer trim options
          .then((data) => {
            if (join){
              this.joinVideos(data, previousVid, nextVid);
            }
            else{
              CameraRoll.saveToCameraRoll(data, 'video').then((value) => {
                console.log("deleting data: " + data);
                this.props.previousVidChange(this.getFileUri(data));
                this.deleteFile(data);
                this.toast();
              }).catch((e) => {
               console.log(e);
              });
              console.log("deleting previousVid: " + previousVid);
              this.deleteFile(previousVid);
              console.log("deleting nextVid: " + nextVid);
              this.deleteFile(nextVid);
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

  _previewCamera(cameraDirection) {
    if (this.props.isPreviewing) {
      return (
        <Camera style={{flex: 1}}
          ref={cam => this.camera=cam}
          aspect={Camera.constants.Aspect.fill}
          captureMode={Camera.constants.CaptureMode.video}
          // captureQuality={Camera.constants.CaptureQuality["1080p"]}
          captureTarget={Camera.constants.CaptureTarget.disk}
          keepAwake={true}
          type={cameraDirection}
          audio={true} />
      );
    }
    else {
      return null;
    }
  }

  render() {
    const { isRecording, previousVid, cameraBack, recordTime, updateRecordTime, orientation } = this.props;
    const cameraDirection = cameraBack ? Camera.constants.Type.back : Camera.constants.Type.front;
    return (
      <View style={styles.wholeContainer}>
        {this._previewCamera(cameraDirection)}
      <View>
        {this._renderCameraBody()}
      </View>
      </View>
    );
  }
}

const ShowVid = ({previousVid, showVids}) => {
    if (previousVid) {
      console.log("show this vid: " + previousVid);
      return (
        <ControlButton onPressHandler={showVids} imageSource={{uri: previousVid}} />
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
    isPreviewing: state.cameraState.isPreviewing,
  };
};

const mapDispatchToProps = (dispatch) => {  
  return bindActionCreators(Actions, dispatch);
};
// function mapDispatchToProps(dispatch) { return bindActionCreators(Actions, dispatch); }

export default connect(mapStateToProps, mapDispatchToProps)(MyCamera);