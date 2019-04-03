import React, {Component} from 'react'
import {Link, Route, Redirect} from 'react-router-dom'
import queryString from 'query-string'
import {connect} from 'react-redux'
import classnames from 'classnames'

import { transURL } from '../../utils/tools'

import './login.scss'
import AppHeader from '../../components/Header'
import Account from './subpage/Account'
import PhoneLogin from './subpage/PhoneLogin'
import Footer from '../../components/Footer'

class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loginWay: 'phone',  // 登录方式，phone or account
      prev: '/'
    }
  }
  componentWillMount() {
    var params = queryString.parse(this.props.location.search)
    // 已登录，不能访问登录页面
    if (this.props.isLogin) {
      if (params.prev) {
        return this.props.history.push(transURL(params.prev))
      }
      return this.props.history.push('/')
    }
    this.setState({
      prev: params.prev ? transURL(params.prev, true) : '/'
    })
  }

  changeLoginWay(way) {
    if (way === this.state.loginWay) return;
    this.setState({
      loginWay: way
    })
  }

	render() {
		/**
		 * v4 包含路由 和 精准路由
		 */
    if (this.props.isLogin === true) {  // 已登录带回原始路由
      return <Redirect to={this.state.prev} />
    }
    var path = this.props.location.pathname
		return (
			<div className="login-body">
        <AppHeader />
				<div className="login-wrap">
					<div className="login-title"></div>
					<div className="login-form">
						<div className="form">
							<div className="form-t">
                <div onClick={this.changeLoginWay.bind(this, 'phone')} className={this.state.loginWay === 'phone' ? 't-l f1' : 't-l f2'}>手机登录</div>
                <div onClick={this.changeLoginWay.bind(this, 'account')} className={this.state.loginWay === 'account' ? 't-l f1' : 't-l f2'}>账户登录</div>
							</div>
							<main>
                {
                  this.state.loginWay === 'phone'
                  ? <PhoneLogin prev={this.state.prev} />
                  : <Account prev={this.state.prev} />
                }
							</main>
						</div>
					</div>
				</div>
        <Footer />
			</div>
		)
	}
}

function mapStateToProps(state) {
	return {
    isLogin: state.auth.isLogin
	}
}

export default connect(mapStateToProps, null)(Login);
