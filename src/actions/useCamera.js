
export const RECORD_STATUS = 'camera/RECORD_STATUS';
export const PREVIEW_STATUS = 'camera/PREVIEW_STATUS';
export const PREVIOUS_VID = 'camera/PREVIOUS_VID';
export const CAMERA_SIDE = 'camera/CAMERA_SIDE';
export const RECORD_TIME = 'camera/RECORD_TIME';
export const ORIENTATION = 'camera/ORIENTATION';

export const recordStatusChange = (isRecording) => {
	return {
		type: RECORD_STATUS,
		isRecording: isRecording,
	}
}

export const previousVidChange = (vidURI = null) => {
	return {
		type: PREVIOUS_VID,
		vidURI: vidURI,
	}
}

export const reverseCamera = () => {
	return {
		type: CAMERA_SIDE,
	}
}

export const updateRecordTime = (recordTime = 15) => {
	return {
		type: RECORD_TIME,
		recordTime: recordTime,
	}
}

export const updateOrientation = (orientation = 'PORTRAIT', width, height) => {
	return {
		type: ORIENTATION,
		orientation: orientation,
		width: width,
		height: height,
	}
}

export const previewChange = (isPreviewing) => {
	return {
		type: PREVIEW_STATUS,
		isPreviewing: isPreviewing,
	}
}