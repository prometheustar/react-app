import {createStore, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'

import rootReducer from './reducers/index.js'

let middleWare = [thunk];
let initialState = {};
// 从本地储存获取 store 初始状态
if (typeof(window) === 'object') {
  var localStore = window.localStorage.getItem('localStoreState')
  if (localStore) {
    try {
      initialState = JSON.parse(localStore)
    }catch(err) {
      console.error(err)
    }
  }
}

// 需要合并的中间件
let composeMiddlewares = [applyMiddleware(...middleWare),];
//激活 chrome 浏览器 redux 插件
if (typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION__) {
	composeMiddlewares.push(window.__REDUX_DEVTOOLS_EXTENSION__())
}
const store = createStore(rootReducer, initialState, compose(...composeMiddlewares));

// 订阅更新函数，每次状态更新都会执行
store.subscribe(() => {
  if (typeof(window) !== 'object') return;
  var state = store.getState()
  window.localStorage.setItem('localStoreState', JSON.stringify({
    order: state.order,
    auth: state.auth
  }))
})

export default store;
