import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  recordButton: {
    borderRadius: 115,
    width: 90,
    height: 90
  },
  controlBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: 25,
    backgroundColor: 'powderblue'
  },
  controlBoxSmall: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'steelblue'
    
  },
  sliderContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'green'
    // marginBottom: 175,
    // marginTop: 260,
  },
  slider: {
    flex:1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [
      { rotateZ : '-90deg' },
    ],

  }
});

module.exports = styles;