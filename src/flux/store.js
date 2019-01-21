import {createStore, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'

import rootReducer from './reducers/index.js'

let middleWare = [thunk];
let initialState = {};
// 需要合并的中间件
let composeMiddlewares = [applyMiddleware(...middleWare),];
//激活 chrome 浏览器 redux 插件
if (window.__REDUX_DEVTOOLS_EXTENSION__) {
	composeMiddlewares.push(window.__REDUX_DEVTOOLS_EXTENSION__())
}
const store = createStore(rootReducer, initialState, compose(...composeMiddlewares));

// 订阅更新函数，每次状态更新都会执行
store.subscribe(() => {
	// console.log("状态更新");
})

export default store;