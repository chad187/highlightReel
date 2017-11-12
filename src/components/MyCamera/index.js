'use strict';
import React, { Component } from 'react';
import { TouchableOpacity, View, Image, Slider, Text, Linking } from 'react-native';
import Camera from 'react-native-camera';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from './../../actions';
import { CameraRoll } from 'react-native';
import RNVideoEditor from 'react-native-video-editor';
import { ProcessingManager } from 'react-native-video-processing';
var RNFS = require('react-native-fs');
const styles = require('./style');

var previousTempVid;

class MyCamera extends Component {

  constructor(props) {
    super(props);

    this.camera = null;
  }

  startRecord() {
    if (this.camera) {
      console.log("trying");
      const options = {};
      // options.location = true;
      // options.totalSeconds = this.props.recordTime * 2;
      this.camera.capture({metadata: options})
        .then((data) => {
          console.log(data)
          this.props.previousVidChange(data.path);
        })
        .catch(err => console.error(err));
      this.props.recordStatusChange(); //this happens when you start it
    }
  }

  stopRecord() {
    if(this.camera){
      this.camera.stopCapture();
      this.props.recordStatusChange();
    }
  }

  reverseCamera() {
    if(this.props.isRecording){
      this.stopRecord();
    }
    this.props.reverseCamera();
  }

  openPhotos() {
    // Linking.canOpenURL('photos-redirect://').then(supported => {
    //  if (!supported) {
   //     console.log('Can\'t handle url: ' + url);
    //  } else {
   //     return Linking.openURL(url);
    //  }
      // }).catch(err => console.error('An error occurred', err));
  }

  saveClip() {
    if(this.props.isRecording){
      this.stopRecord();
      this.startRecord();
    }
  }

  joinVideos(clip1, clip2) {
    RNVideoEditor.merge(
      [clip1, clip2],
      (results) => {
        alert('Error: ' + results);
      },
      (results, file) => {
        CameraRoll.saveToCameraRoll(file, 'video').then((value) => {
          console.log(value);
          this.props.previousVidChange(value);
          this.deleteFile(clip1);
          this.deleteFile(clip2);
          alert('Success : ' + results + " file: " + file);
        }).catch((e) => {
          console.log(e);
        });
      }
    );
  }

  trimVideo(source, startTime, endTime) {
    const options = {
        startTime: startTime,
        endTime: endTime,
        saveToCameraRoll: true, // default is false // iOS only
        saveWithCurrentDate: true, // default is false // iOS only
    };

    ProcessingManager.trim(source, options) // like VideoPlayer trim options
          .then((data) => {
            console.log(data)//need to see what this data is before I know what to do with next lines
       //     CameraRoll.saveToCameraRoll(???, 'video').then((value) => {
            //  console.log(value);
            //  this.props.previousVidChange(value);
            //  this.deleteFile(source);
            // }).catch((e) => {
            //  console.log(e);
            // });
          });
  }

  deleteFile(filepath) {
    RNFS.exists(filepath)
    .then( (result) => {
        console.log("file exists: ", result);

        if(result){
          return RNFS.unlink(filepath)
            .then(() => {
              console.log('FILE DELETED');
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

  _renderCameraTrue() {
    return (
      <View style={styles.innerContainer}>
        <View style={styles.buttonContainer}>
          <View style={{width: 90, height: 90}} />
          <ControlButton onPressHandler={this.saveClip.bind(this)} imageSource={require('./saveClip.png')} />
          <ControlButton onPressHandler={this.stopRecord.bind(this)} imageSource={require('./stopRec.png')} />
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
          <HistoryBar style={styles.slider} updateMethod={this.props.updateRecordTime} recordTime={this.props.recordTime} />
        </View>
        <View style={styles.buttonContainer}>
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
    const { isRecording, previousVid, cameraBack, recordTime, updateRecordTime } = this.props;
    const cameraDirection = cameraBack ? Camera.constants.Type.back : Camera.constants.Type.front;
    return (
      <View style={styles.wholeContainer}>
        <Camera style={{flex: 1}}
          ref={cam => this.camera=cam}
          aspect={Camera.constants.Aspect.fill}
          captureMode={Camera.constants.CaptureMode.video}
          // captureTarget={Camera.constants.CaptureTarget.disk}
          keepAwake={true}
          type={cameraDirection}
          audio={true}>

          {this._renderCameraBody()}

        </Camera>
      </View>
    );
  }
}

const ShowVid = ({previousVid, showVids}) => {
  if (previousVid) {
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

const HistoryBar = ({ style, updateMethod, recordTime }) => {
  return(
    <Slider
      disabled={false}
      maximumValue={60}
      minimumValue={5}
      onValueChange= {(value) => updateMethod(value)}
      step={5}
      style={style}
      value={recordTime} />
  );
};

const mapStateToProps = (state) => { 
  return {
    isRecording: state.cameraState.isRecording, 
    previousVid: state.cameraState.previousVid,
    cameraBack: state.cameraState.cameraBack,
    recordTime: state.cameraState.recordTime,
  };
};

const mapDispatchToProps = (dispatch) => {  
  return bindActionCreators(Actions, dispatch);
};
// function mapDispatchToProps(dispatch) { return bindActionCreators(Actions, dispatch); }

export default connect(mapStateToProps, mapDispatchToProps)(MyCamera);