import React, { Component } from 'react';
import {Route, Redirect, withRouter} from 'react-router-dom';
import axios from 'axios'
import { connect } from 'react-redux'

import "./App.scss"
import config from './utils/config.js'
import socket from './utils/socket'

import Home from './containers/Home'
import Register from './containers/Register'
import Login from './containers/Login'
import SearchProduct from './containers/SearchProduct'
import GotoSearchProduct from './containers/SearchProduct/GotoSearchProduct'
import ProductDetail from './containers/ProductDetail'
import UserInfo from './containers/UserInfo'
import Order from './containers/Order'
import PayOrder from './containers/PayOrder'
import ShopingCart from './containers/ShopingCart'
import Chat from './components/Chat'

import { setAuthToken, setCurrentUser } from './utils/setAuth'
if (typeof(window) === 'object') {
  // 验证本地 token
  const jwtToken = window.localStorage.jwtToken;
  if (jwtToken) {
    axios.defaults.headers.common["Authorization"] = jwtToken; // 设置请求头 token
    // 验证请求头token
    axios.get(config.HOST + '/api/users/current')
      .then(res => {
        if (!res.data.success) {
          setAuthToken(false);
          setCurrentUser({});
        } else {
          // token 验证成功
          setAuthToken(jwtToken);
          setCurrentUser(res.data.payload);
        }
      })
      .catch(err => {
        setAuthToken(false);
        setCurrentUser({});
      });
  }
}

const App = (props) => {
  return (
    <div className="App">
      <Route path="/" exact component={Home} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      {/*路径参数变化不会触发组件刷新，此处需要跳转*/}
      <Route path="/search_product" exact component={GotoSearchProduct} />
      <Route path="/search_products" exact component={SearchProduct} />
      <Route path="/product_detail" exact component={ProductDetail} />
      <Route path="/member" component={UserInfo} />
      <Route path="/order" exact component={Order} />
      <Route path="/payorder" exact component={PayOrder} />
      {/*<Redirect to="/" />*/}
      <ShopingCart />
      {
        props.hideChat ? null : <Chat />
      }
    </div>
  )
}
// class App extends Component {
//   render() {
//     return (
//       <div className="App">
//         <Route path="/" exact component={Home} />
//         <Route path="/register" component={Register} />
//         <Route path="/login" component={Login} />
//         {/*路径参数变化不会触发组件刷新，此处需要跳转*/}
//         <Route path="/search_product" exact component={GotoSearchProduct} />
//         <Route path="/search_products" exact component={SearchProduct} />
//         <Route path="/product_detail" exact component={ProductDetail} />
//         <Route path="/member" component={UserInfo} />
//         <Route path="/order" exact component={Order} />
//         <Route path="/payorder" exact component={PayOrder} />
//         {/*<Redirect to="/" />*/}
//         <ShopingCart />
//         {
//           this.props.hideChat ? null : <Chat />
//         }
//       </div>
//     )
//   }
// }

function mapStateToProps(state) {
  return {
    hideChat: state.chat.hideChat
  }
}

export default withRouter(connect(mapStateToProps)(App))
