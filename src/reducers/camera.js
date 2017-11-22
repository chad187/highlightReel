import {RECORD_STATUS, PREVIOUS_VID, CAMERA_SIDE, RECORD_TIME, ORIENTATION} from '../actions/';

let initialState = { isRecording: false, previousVid: null, cameraBack: true, recordTime: 15, orientation: 'PORTRAIT', width: null, height: null };

let cloneObject = function(obj){
	return JSON.parse(JSON.stringify(obj))
}

export default (state = initialState, action) => {
	switch (action.type) {
		
		case RECORD_STATUS:
			newState = cloneObject(state);
			if (action.isRecording != null){
				newState.isRecording = action.isRecording;
			}
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
		
		case RECORD_TIME:
			newState = cloneObject(state);
			if (action.recordTime){
				newState.recordTime = action.recordTime;
			}
			return newState;

		case ORIENTATION:
			newState = cloneObject(state);
			if (action.orientation){
				newState.orientation = action.orientation;
			}

			if (action.width){
				newState.width = action.width;
			}

			if (action.height){
				newState.height = action.height;
			}

			return newState;
			
		default:
			return state;
	}
};