import {createStore, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'

import rootReducer from './reducers/index.js'

let middleWare = [thunk];
let initialState = {};
const store = createStore(rootReducer, initialState, compose(
		applyMiddleware(...middleWare),
		//激活 chrome 浏览器 redux 插件
		window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
	));

// 订阅更新函数，每次状态更新都会执行
store.subscribe(() => {
	// console.log("状态更新");
})

export default store;