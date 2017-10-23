'use strict';
import React, { Component } from 'react';
import { TouchableOpacity, View, Image } from 'react-native';
import Camera from 'react-native-camera';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from './../../actions';
const styles = require('./style');

class MyCamera extends Component {
  render() {
    return (
      <View id={1} style={styles.container}>
        <Camera style={{flex: 1}}
          ref={cam => this.camera=cam}
          aspect={Camera.constants.Aspect.fill}>
          {true ? 
          	<View id={2} style={styles.controlBox}>
          		<ControlButton onPressHandler={this.takePicture.bind(this)} imageSource={require('./record.png')} />
	          	<ControlButton onPressHandler={this.takePicture.bind(this)} imageSource={require('./saveClip.png')} />
	          	<ControlButton onPressHandler={this.takePicture.bind(this)} imageSource={require('./stopRec.png')} />
	          </View>
          	:
          	<View id={3} style={styles.controlBox}>
          		<ControlButton onPressHandler={this.takePicture.bind(this)} imageSource={require('./record.png')} />
          		<ControlButton onPressHandler={this.takePicture.bind(this)} imageSource={require('./record.png')} />
          		<ControlButton/>
          	</View>
          }
        </Camera>
      </View>
    );
  }

  takePicture() {
    const options = {};
    //options.location = ...
    this.camera.capture({metadata: options})
      .then((data) => console.log(data))
      .catch(err => console.error(err));
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

function mapStateToProps(state) { return {user: state.userReducers.user}; }
function mapDispatchToProps(dispatch) { return bindActionCreators(Actions, dispatch); }

export default connect(mapStateToProps, mapDispatchToProps)(MyCamera);