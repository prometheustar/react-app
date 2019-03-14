/**
 * 合并多个 reducer 成一个大的reducer
 */

import {combineReducers} from 'redux'

import register from './register'
import auth from './authReducer'
import product from './product'
import order from './order'
import chat from './chat'

let rootReducer = combineReducers({
	register,
	auth,
  product,
  order,
  chat
});
export default rootReducer;
