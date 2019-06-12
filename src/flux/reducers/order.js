const initialState = {
  buyProducts: [],   // 待购买的商品
  payOrder: {},
  payStatus: 'nosuccess',
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
