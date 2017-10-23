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
    
  }
});

module.exports = styles;