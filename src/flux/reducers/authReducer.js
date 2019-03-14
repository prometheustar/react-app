import {isEmpty} from '../../utils/validator'

var initialState = {
  location: '',  // 记录路由地址
	isLogin: false,
	loginWay: 'phone',
	user: {},
  isVerify: true,  // 账号验证中
  address: [],  // 收货地址
  shopCar: [],  // 购物车
}
const authReducer = (state = initialState, action) => {
	switch (action.type) {
		case 'SET_LOGIN_WAY':
			return {
				...state,
				loginWay: action.payload
			}
		case 'SET_CURRENT_USER': // 登陆或 App.js 验证 localStorage中 token 时触发
			return {
				...state,
				isLogin: !isEmpty(action.payload),
				user: !isEmpty(action.payload) ? action.payload.user : {},
        isVerify: false,  // 设置 auth.isVerifu = false (验证结束)
        address: action.payload.address || []
			}
    case 'SET_ROUTER_LOCATION':
      return {
        ...state,
        location: action.payload
      }
    case 'SET_SHOP_CAR':
      return {
        ...state,
        shopCar:action.payload
      }
		default:
			return state
	}
}
export default authReducer;
