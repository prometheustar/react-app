/**
 * 合并多个 reducer 成一个大的reducer
 */

import {combineReducers} from 'redux'

import register from './register.js'
import auth from './authReducer.js'

let rootReducer = combineReducers({
	register,
	auth
});
export default rootReducer;