//components/Login.js
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Actions from '../actions';

import { View, TouchableHighlight, Text, StyleSheet } from 'react-native';

class Login extends Component{
	onLoginButtonPress = () => {
		this.props.login({
			userName: 'tester',
			password: '8679305'
		});
	}

	render() {
		return (
			<View style={styles.tester}>
			{
				!this.props.user.loggedIn ? 
					<TouchableHighlight onPress={this.onLoginButtonPress}>
						<Text>Log in</Text>
					</TouchableHighlight>
					:

					<View>
						<Text>Wow you logged in!</Text>
					</View>
			}
			</View>
		);
	}
};

const styles = StyleSheet.create({
  tester: {
		flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

function mapStateToProps(state) { return {user: state.userReducers.user}; }
function mapDispatchToProps(dispatch) { return bindActionCreators(Actions, dispatch); }

export default connect(mapStateToProps, mapDispatchToProps)(Login);