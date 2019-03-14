import store from '../store'
/**
 * 订单 Action
 */
export const setBuyProductsAction = products => dispatch => {
  dispatch({
    type: 'SET_BUY_PRODUCTS',
    payload: products
  })
}

/**
 * 付款页面信息
 */
export const setPayOrderAction = payOrder => dispatch => {
  dispatch({
    type: 'SET_PAY_ORDER',
    payload: payOrder
  })
}
/**
 * 付款成功
 */
export const payOrderSuccessAction = orderno => {
  store.dispatch({
    type: 'PAY_SUCCESS'
  })
}
