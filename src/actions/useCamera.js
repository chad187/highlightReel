
export const RECORD_STATUS = 'camera/RECORD_STATUS';
export const PREVIOUS_VID = 'camera/PREVIOUS_VID';
export const CAMERA_SIDE = 'camera/CAMERA_SIDE';

export const recordStatusChange = () => {
	return {
		type: RECORD_STATUS
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