//index.android.js
import React, { Component } from 'react';
import {AppRegistry, Text, View} from 'react-native';
import Login from'./src/components/Login';
import MyCamera from'./src/components/MyCamera';
import userReducers from './src/reducers/user';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import devToolsEnhancer from 'remote-redux-devtools';

let store = createStore(combineReducers({userReducers}), devToolsEnhancer({ realtime: true }));
class App extends Component {
    render(){
      return(
        <MyCamera />
        // <Login/>
      );
    }
}

class MyApp extends Component {
  render(){
    return (
      <Provider store={store}>
        <App />
      </Provider>
    );
  }
}

export default MyApp;