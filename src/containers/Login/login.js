import React from 'react'
import {connect} from 'react-redux'
import cnames from 'classnames'

import AuthHeader from '../../components/AuthHeader'
import PhoneLogin from './subpage/PhoneLogin'
import Account from './subpage/Account'


class Login extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isPhoneLogin: true
		}
		this.toggle = this.toggle.bind(this);
	}
	onSubmit(e) {
		e.preventDefault();
	}
	toggle() {
		this.setState({
			isPhoneLogin: !this.state.isPhoneLogin
		});
	}
	render() {
		return (
			<div>
				<AuthHeader auth="login" />
				<div className="login-wrap">
					<div className="login-title"></div>
					<div className="login-form">
						<form onSubmit={this.onSubmit}>
							<div className="form-t">
								<div onClick={this.toggle}
									className={cnames('t-l', {
										f1: this.state.isPhoneLogin,
										f2: !this.state.isPhoneLogin
									})}
									>手机登录</div>
								<div onClick={this.toggle}
									className={cnames('t-r', {
										f1: !this.state.isPhoneLogin,
										f2: this.state.isPhoneLogin
									})}
									>账户登录</div>
							</div>
							{
								this.state.isPhoneLogin ? 
								<PhoneLogin / > :
								<Account />
							}
						</form>
					</div>
				</div>
			</div>
		)
	}
}

const mapStateToProps = function (state) {
	return {
		auth: state.auth
	}
}
export default connect(mapStateToProps, null)(Login);