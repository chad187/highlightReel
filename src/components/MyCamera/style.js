import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  wholeContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  recordButton: {
    borderRadius: 115,
    width: 90,
    height: 90,
    backgroundColor: 'blue',
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: 25,
    backgroundColor: 'orange',
    width: width,
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: height,
    backgroundColor: 'yellow'
    
  },
  sliderContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: width,
    backgroundColor: 'green'
    // marginBottom: 175,
    // marginTop: 260,
  },
  slider: {
    flex:0,
    // flexDirection: 'column',
    // justifyContent: 'flex-end',
    // alignItems: 'center',
    // height: height * .5,
    transform: [
      { rotateZ : '-90deg' },
    ],
    backgroundColor: 'white',

  }
});

module.exports = styles;