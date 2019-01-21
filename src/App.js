import "./App.scss"
import config from './utils/config.js'
import Home from './containers/Home'
import Register from './containers/Register'
import Login from './containers/Login'
import store from './flux/store'

import React, { Component } from 'react';
import {BrowserRouter, Route, Redirect, Link} from 'react-router-dom';
import {Provider} from 'react-redux'
import axios from 'axios'

import {setAuthToken, setCurrentUser} from './utils/setAuth'
// 验证本地 token
const jwtToken = window.localStorage.jwtToken;
if (jwtToken) {
  setAuthToken(jwtToken); // 设置请求头 token
  // 验证请求头token
  axios.get(config.HOST + '/api/users/current')
    .then(res => {
      console.log(res);
      if (!res.data.success) {
        setAuthToken(false);
        setCurrentUser({});
      } else {
        // token 验证成功
        setAuthToken(jwtToken);
        setCurrentUser(res.data.payload.user);
      }
    })
    .catch(err => {
      setAuthToken(false);
      setCurrentUser({});
    });
}

class App extends Component {
  componentDidMount(){
    // console.log(process.env);
  }
  render() {
    return (
        <Provider store={store}>
          <BrowserRouter>
            <div className="App">
              <Route path="/" exact component={Home} />
              <Route path="/register" component={Register} />
              <Route path="/login" component={Login} />
              {/*<Redirect to="/" />*/}
            </div>
          </BrowserRouter>
        </Provider>
    );
  }
}

export default App;
