'use strict';
import React, { Component } from 'react';
import { TouchableOpacity, View, Image } from 'react-native';
import Camera from 'react-native-camera';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from './../../actions';
import { CameraRoll } from 'react-native';
const styles = require('./style');
let previousVid = 'content://media/external/images/media/29411';

class MyCamera extends Component {

	constructor(props) {
    super(props);

    this.camera = null;
  }

	componentWillMount () {
		CameraRoll.getPhotos({first: 1, assetType: 'Videos'}).then((value) => {
			console.log(value);
  		this.props.previousVidChange(value.edges[0].node.image.uri);
		}).catch((e) => {
			console.log(e);
		});
	}

	startRecord() {
		if (this.camera) {
      const options = {};
	    options.location = true;
	    this.camera.capture({metadata: options})
	      .then((data) => {
	      	console.log(data)
	      	this.props.recordStatusChange();
	  			this.props.previousVidChange(data.path);
	      })
	      .catch(err => console.error(err));
	    this.props.recordStatusChange();
    }
  }

  stopRecord() {
  	if(this.camera){
	  	this.camera.stopCapture();
	  }
  }

  reverseCamera() {
  	if(this.props.isRecording){
  		this.stopRecord();
  	}
  	this.props.reverseCamera();
  }

  render() {
  	const { isRecording, previousVid, cameraBack } = this.props;
  	const cameraDirection = cameraBack ? Camera.constants.Type.back : Camera.constants.Type.front;
    return (
      <View id={1} style={styles.container}>
        <Camera style={{flex: 1}}
          ref={cam => this.camera=cam}
          aspect={Camera.constants.Aspect.fill}
          captureMode={Camera.constants.CaptureMode.video}
          keepAwake={true}
          type={cameraDirection}
          audio={true}
          >
          {isRecording ? 
          	<View id={2} style={styles.controlBox}>
          		<ControlButton onPressHandler={this.startRecord.bind(this)} imageSource={{uri: previousVid}} />
	          	<ControlButton onPressHandler={this.startRecord.bind(this)} imageSource={require('./saveClip.png')} />
	          	<ControlButton onPressHandler={this.stopRecord.bind(this)} imageSource={require('./stopRec.png')} />
	          </View>
          	:
          	<View id={3} style={styles.controlBox}>
          		<ControlButton onPressHandler={this.startRecord.bind(this)} imageSource={{uri: previousVid}} />
          		<ControlButton onPressHandler={this.startRecord.bind(this)} imageSource={require('./record.png')} />
          		<ControlButton onPressHandler={this.reverseCamera.bind(this)} imageSource={require('./reverseCamera.png')} />
          	</View>
          }
        </Camera>
      </View>
    );
  }
}

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

const mapStateToProps = (state) => { 
	return {
		isRecording: state.cameraState.isRecording, 
		previousVid: state.cameraState.previousVid,
		cameraBack: state.cameraState.cameraBack
	};
};

const mapDispatchToProps = (dispatch) => {	
	return bindActionCreators(Actions, dispatch);
};
// function mapDispatchToProps(dispatch) { return bindActionCreators(Actions, dispatch); }

export default connect(mapStateToProps, mapDispatchToProps)(MyCamera);