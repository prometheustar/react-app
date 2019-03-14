var initialState = {
  searchGoods: [],
  searchStores: [],
  searchKey: '',
  productDetail: {
    comments: [],
    goodDetail: [],
    goodInfo: {},
    infoPicture: [],
    smaillPicture: [{}],
    message: '加载中。。。'
  }
}

var productReducer = (state = initialState, action) => {
  switch(action.type) {
    case 'SET_SEARCH_GOODS':
      return {
        ...state,
        searchGoods: action.payload
      }
    case 'SET_SEARCH_STORES':
      return {
        ...state,
        searchStores: action.payload
      }
    case 'SET_SEARCH_KEY':
      return {
        ...state,
        searchKey: action.payload
      }
    case 'SET_PRODUCT_DETAIL':
      return {
        ...state,
        productDetail: action.payload
      }
    default:
      return state
  }
}

export default productReducer
export const productDetailInitialState = initialState