'use strict';
import React, { Component } from 'react';
import { TouchableOpacity, View, Image, Slider, Text } from 'react-native';
import Camera from 'react-native-camera';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from './../../actions';
import { CameraRoll } from 'react-native';
const styles = require('./style');

class MyCamera extends Component {

	constructor(props) {
    super(props);

    this.camera = null;
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
  	const { isRecording, previousVid, cameraBack, recordTime, updateRecordTime } = this.props;
  	const cameraDirection = cameraBack ? Camera.constants.Type.back : Camera.constants.Type.front;
    return (
      <View id={1} style={styles.wholeContainer}>
        <Camera style={{flex: 1}}
          ref={cam => this.camera=cam}
          aspect={Camera.constants.Aspect.fill}
          captureMode={Camera.constants.CaptureMode.video}
          // captureTarget={Camera.constants.CaptureTarget.disk}
          keepAwake={true}
          type={cameraDirection}
          audio={true}
          >
          {isRecording ? 
          	<View style={styles.innerContainer}>
	          	<View id={2} style={styles.buttonContainer}>
	          		<View style={{width: 90, height: 90}} />
		          	<ControlButton onPressHandler={this.startRecord.bind(this)} imageSource={require('./saveClip.png')} />
		          	<ControlButton onPressHandler={this.stopRecord.bind(this)} imageSource={require('./stopRec.png')} />
		          </View>
		        </View>
          	:
          	<View id={3} style={styles.innerContainer}>
          		<View style={styles.timeContainer}>
          			<Text style={styles.recordTime}>
	          			{recordTime}s
	        			</Text>
          		</View>
          		<View id={4} style={styles.sliderContainer}>
	          		<HistoryBar disabled={false} style={styles.slider} updateMethod={updateRecordTime} />
	          	</View>
          		<View id={5} style={styles.buttonContainer}>
	          		<View style={{width: 90, height: 90, backgroundColor: 'steelblue'}} />
	          		<ControlButton onPressHandler={this.startRecord.bind(this)} imageSource={require('./record.png')} />
	          		<ControlButton onPressHandler={this.reverseCamera.bind(this)} imageSource={require('./reverseCamera.png')} />
	          	</View>
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

const HistoryBar = ({ disabled, style, updateMethod }) => {
	return(
		<Slider
			disabled={disabled}
			maximumValue={60}
			minimumValue={5}
			onValueChange= {(value) => updateMethod(value)}
			step={5}
			style={style}
			value={15}>
		</Slider>
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