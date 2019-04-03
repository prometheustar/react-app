import axios from 'axios'
import store from '../flux/store'
import socket from './socket'
import { isEmpty } from '../utils/validator'

export const setAuthToken = token => {
	if (token) {
		// 让每个请求头携带 token
		axios.defaults.headers.common["Authorization"] = token;
		 // 添加localStorage 储存token
		window.localStorage.setItem("jwtToken", token);
    // 初始化 websocket
    if (socket.status === 'close') {
      socket.initSocket(token)
    }
	} else {
		// 删除请求头 token
		delete axios.defaults.headers.common["Authorization"];
		// 删除localStorage储存的 token
    window.localStorage.removeItem("jwtToken");
		// window.localStorage.clear();
	}
}

export const setCurrentUser = user => {
  if (isEmpty(user)) {
    if (socket.status === 'open') {
      socket.ws.close()
    }
    store.dispatch({ type: 'LOGIN_OUT_CHAT' })
  }
	store.dispatch({
		type: 'SET_CURRENT_USER',
		payload: user
	})
}

