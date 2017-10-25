import {RECORD_STATUS, PREVIOUS_VID, CAMERA_SIDE} from '../actions/';

let initialState = { isRecording : false, previousVid: null, cameraBack: true };

let cloneObject = function(obj){
	return JSON.parse(JSON.stringify(obj))
}

export default (state = initialState, action) => {
	switch (action.type) {
		case RECORD_STATUS:
			newState = cloneObject(state);
			newState.isRecording = !newState.isRecording;
			return newState;
		case PREVIOUS_VID:
			newState = cloneObject(state);
			if (action.vidURI){
				newState.previousVid = action.vidURI;
			}
			else {
				newState.previousVid = state.previousVid;
			}
			return newState;
		case CAMERA_SIDE:
			newState = cloneObject(state);
			newState.cameraBack = !newState.cameraBack;
			return newState;
		default:
			return state;
	}
};