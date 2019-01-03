import {isEmpty} from '../../utils/validator'

var initialState = {
	isLogin: false,
	loginWay: 'phone',
	user: {}
}
const authReducer = (state = initialState, action) => {
	switch (action.type) {
		case 'SET_LOGIN_WAY':
			return {
				...state,
				loginWay: action.payload
			}
		case 'SET_CURRENT_USER':
			return {
				...state,
				isLogin: !isEmpty(action.payload),
				user: action.payload
			}
		default:
			return state;
	}
}
export default authReducer;