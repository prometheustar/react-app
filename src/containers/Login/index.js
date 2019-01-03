import React, {Component} from 'react'
import {Link, Route} from 'react-router-dom'
import {connect} from 'react-redux'
import cnames from 'classnames'

import './login.scss'
import Account from './subpage/Account'
import PhoneLogin from './subpage/PhoneLogin'

class Login extends Component {
	render() {
		/**
		 * v4 包含路由 和 精准路由
		 */
		// 登录样式
		let loginWay = this.props.auth.loginWay;
		const classPhone = loginWay === 'phone' ? 'f1' : 'f2';
		const classAccount = loginWay === 'account' ? 'f1' : 'f2';
		return (
			<div>
				<div className="login-wrap">
					<div className="login-title"></div>
					<div className="login-form">
						<div className="form">
							<div className="form-t">
								<Link to="/login">
									<div className={'t-l ' + classPhone}>手机登录</div>
								</Link>
								<Link to="/login/account">
									<div className={'t-r ' + classAccount}>账户登录</div>
								</Link>
							</div>
							<main>
								<Route exact path="/login/account" component={Account} />
								<Route exact path="/login" component={PhoneLogin} />
							</main>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

function mapStateToProps(state) {
	return {
		auth: state.auth
	}
}

export default connect(mapStateToProps, null)(Login);