import { combineReducers } from 'redux';
import messages from './messages';
import gridData from './gridData';
import zoneData from './zoneData';

export default combineReducers({
	messages,
	gridData,
	zoneData
});
