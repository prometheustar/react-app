import React from 'react';
import {Route, withRouter, Switch} from 'react-router-dom';
import axios from 'axios'
import { connect } from 'react-redux'

import config from './utils/config.js'

import "./App.scss"
import PrivateRoute from './components/PrivateRoute'
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
import MessageBox from './components/MessageBox'
import Confirm from './components/MessageBox/Confirm'
import Loading from './components/MessageBox/Loading'
import Footer from './components/Footer'

import { setAuthToken, setCurrentUser } from './utils/setAuth'
if (typeof(window) === 'object') {
  // 验证本地 token
  const jwtToken = window.localStorage.jwtToken;
  if (!jwtToken) {
    setAuthToken(false);
    setCurrentUser({});
  }else {
    axios.defaults.headers.common["Authorization"] = jwtToken; // 设置请求头 token
    // 验证请求头token
    axios.get(`${config.HOST}/api/users/current`)
      .then(res => {
        if (!res.data.success) {
          setAuthToken(false);
          setCurrentUser({});
        } else {
          // token 验证成功
          setAuthToken(res.data.payload.token);
          setCurrentUser(res.data.payload.user);
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
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        {/*参数变化路径不变不会触发组件刷新，此处需要跳转*/}
        <Route path="/search_product" component={GotoSearchProduct} />
        <Route path="/search_products" component={SearchProduct} />
        <Route path="/product_detail" component={ProductDetail} />
        <PrivateRoute path="/order" component={Order} />
        <PrivateRoute path="/member" component={UserInfo} />
        <PrivateRoute path="/payorder" component={PayOrder} />
      </Switch>
      <ShopingCart />
      {
        // 聊天框
        props.hideChat ? null : <Chat />
      }
      {
        // 消息框
        props.showAlert ? <MessageBox /> : null
      }
      {
        // 确认框
        props.showConfirm ? <Confirm /> : null
      }
      {
        //<Loading />
      }
    </div>
  )
}

function mapStateToProps(state) {
  return {
    hideChat: state.chat.hideChat,
    showAlert: state.messageBox.showAlert,
    showConfirm: state.messageBox.showConfirm
  }
}

export default withRouter(connect(mapStateToProps)(App))
