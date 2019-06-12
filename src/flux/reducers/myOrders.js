/**
 * FireFox 初始 store 深层对象消失，从 order 单独提取出来
 */
const initialState = { // 我的订单
  end: true,
  limit: 0,
  orders: [],
  status: {
    waitPay: 0,
    waitSend: 0,
    waitSign: 0,
    waitComment: 0,
    finish: 0
  }
}
const myOrdersReducer = (state = initialState, action) => {
  switch(action.type) {
    case 'GET_MY_ORDERS':
      return {
        ...action.payload
      }
    case 'PREV_PAGE_ORDERS':
      return {
        ...state,
        end: false,
        limit: state.limit > 0 ? state.limit -1 : state.limit
      }
    default:
      return state
  }
}

export const myOrdersInitState = initialState

export default myOrdersReducer

