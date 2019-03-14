import store from '../store'

export const setLoginWay = way => dispatch => {
	dispatch({
		type: 'SET_LOGIN_WAY',
		payload: way
	});
}

export const setRouterLocationAction = location => dispatch => {
  dispatch({
    type: 'SET_ROUTER_LOCATION',
    payload: location
  })
}

export const setShopCarAction = shopCarInfo => {
  if (!Array.isArray(shopCarInfo)) return;
  // 将商品按 店铺进行分组
  let shopCar = []
  if (shopCarInfo.length > 0) {
    shopCar[0] = {
      storeId: shopCarInfo[0].product.storeId,
      storeName: shopCarInfo[0].product.storeName,
      products: [shopCarInfo[0]]
    }
    for (let i = 1, len = shopCarInfo.length; i < len; i++) {
      for (let j = 0, len2 = shopCar.length; j < len2; j++) {
        if (shopCarInfo[i].product.storeId === shopCar[j].storeId) {
          shopCar[j].products.push(shopCarInfo[i])
          break
        }
        if (j === len2-1) {
          shopCar.push({
            storeId: shopCarInfo[i].product.storeId,
            storeName: shopCarInfo[i].product.storeName,
            products: [shopCarInfo[i]]
          })
        }
      }
    }
  }
  store.dispatch({
    type: 'SET_SHOP_CAR',
    payload: shopCar
  })
}
