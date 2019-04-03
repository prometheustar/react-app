const initialState = {
  buyProducts: [],   // 待购买的商品
  payOrder: {},
  payStatus: 'nosuccess',
  myOrders: { // 我的订单
    end: true,
    limit: 0,
    status: {
      waitPay: 0,
      waitSend: 0,
      waitSign: 0,
      waitComment: 0,
      finish: 0
    },
    orders: []
  }
}

const orderReducer = (state = initialState, action) => {
	switch(action.type) {
    case 'SET_BUY_PRODUCTS':
      return {
        ...state,
        buyProducts: action.payload
      }
    case 'SET_PAY_ORDER':
      return {
        ...state,
        payOrder: action.payload
      }
    case 'PAY_SUCCESS':
      return {
        ...state,
        payStatus: 'success'
      }
    case 'GET_MY_ORDERS':
      return {
        ...state,
        myOrders: action.payload
      }
    case 'PREV_PAGE_ORDERS':
      return {
        ...state,
        myOrders: {...state.myOrders,
          end: false,
          limit: state.myOrders.limit > 0 ? state.myOrders.limit -1 :state.myOrders.limit
        }
      }
    case 'PAY_ORDER_SUCCESS':
      return {
        ...state,
        buyProducts: [],   // 待购买的商品
        payOrder: {},
        payStatus: 'nosuccess',
      }
    default:
      return state
	}
}
export default orderReducer
