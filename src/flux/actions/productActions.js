import store from '../store'
import axios from 'axios'
import config from '../../utils/config'
import { productDetailInitialState } from '../reducers/product.js'

const HOST = config.HOST
const state = store.getState()

// 搜索的 goods
export const setSearchGoodsAction = goods => dispatch => {
  dispatch({
    type: 'SET_SEARCH_GOODS',
    payload: goods
  })
}

// 设置搜索的 Store
export const setSearchStoresAction = stores => dispatch => {
  dispatch({
    type: 'SET_SEARCH_STORES',
    payload: stores
  })
}

// 设置搜索关键字
export const setSearchKeyAction = searchKey => dispatch => {
  dispatch({
    type: 'SET_SEARCH_KEY',
    payload: searchKey
  })
}

// 设置商品详情页数据
export const setProductDetailAction = goodId => dispatch => {
  // if (state.product.productDetail._id === goodId) return;
  if (goodId === -1) {
    // 清空数据
    dispatch({
      type: 'SET_PRODUCT_DETAIL',
      payload: productDetailInitialState
    })
  }
  axios.get(`${HOST}/api/goods/product_detail?goodId=${goodId}`)
    .then(res => {
      if (res.data.success) {
        dispatch({
          type: 'SET_PRODUCT_DETAIL',
          payload: res.data.payload
        })
      }else {
        dispatch({
          type: 'SET_PRODUCT_DETAIL',
          payload: { ...state.product.productDetail, message: res.data.message, error: '' }
        })
      }
    })
    .catch(err => {
      dispatch({
        type: 'SET_PRODUCT_DETAIL',
        payload: { ...state.product.productDetail, error: err.message, message: '' }
      })
    })
}
