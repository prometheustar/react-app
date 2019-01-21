import axios from 'axios'
import store from '../flux/store'

export const setAuthToken = token => {
	if (token) {
		// 让每个请求头携带 token
		axios.defaults.headers.common["Authorization"] = token;
		 // 添加localStorage 储存token
		window.localStorage.setItem("jwtToken", token);
	} else {
		// 删除请求头 token
		delete axios.defaults.headers.common["Authorization"];
		// 删除localStorage储存的 token
		window.localStorage.removeItem("jwtToken");
	}
}

export const setCurrentUser = payload => {
	store.dispatch({
		type: 'SET_CURRENT_USER',
		payload
	})
}