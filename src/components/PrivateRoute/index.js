import React from 'react'
import { connect } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'
import WaitVerify from './subpage/WaitVerify'

import { transURL } from '../../utils/tools'

const PrivateRoute = ({component: Component, isLogin, isVerify, ...rest}) => (
  <Route {...rest} render={(props) => (
      isLogin
      ? <Component {...props} />
      : isVerify  // 本地 token 验证中
      ? <WaitVerify message="账号认证中...." />
      : <Redirect to={`/login?prev=${transURL(props.location.pathname + props.location.search)}`} />
    )} />
)

// Redirect 传当前 URL 路径
// to={{
//   pathname: `/login?prev=${transURL(props.location.pathname + props.location.search)}`,
//   state: {from: props.location} //通过将字符串中Redirect的toprop替换为对象并传递一个state键，该键的值是location用户尝试访问的路径的当前值。
// }}
function mapStateToProps(state) {
  return {
    isLogin: state.auth.isLogin,
    isVerify: state.auth.isVerify
  }
}
export default connect(mapStateToProps)(PrivateRoute)
