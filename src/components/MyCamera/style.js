import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  wholeContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    // backgroundColor: 'yellow'
    
  },
  buttonContainer: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: 25,
    // backgroundColor: 'orange',
    width: width,
  },
  sliderContainer: {
    flex: 4,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    // backgroundColor: 'green',
  },
  timeContainer: {
    flex: 1.6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    // backgroundColor: 'brown',
  },
  recordButton: {
    borderRadius: 115,
    width: 90,
    height: 90,
    // backgroundColor: 'blue',
  },
  recordTime: {
    flex: 0,
    color: 'white',
    fontSize: 70,
  },
  slider: {
    flex:1,
    height: height * .1,
    // backgroundColor: 'white'
  }
});

module.exports = styles;