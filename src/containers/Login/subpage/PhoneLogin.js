import React from 'react'
import axios from 'axios'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import {setLoginWay} from '../../../flux/actions/authActions'

class PhoneLogin extends React.Component {
	constructor() {
		super();
		this.state = {
			phone: {
				value: '',
				isLegal: false,
				state: 1
			},
			checkcode: {
				value: '',
				isLegal: false,
				state: 1
			}
		}
	}
	componentWillMount() {
		if (this.props.auth.loginWay !== 'phone') {
			this.props.setLoginWay('phone');
		}
	}
	sendSMS() {
		
	}
	render() {
		return (
			<div className="l-input-wrap">
				<div className="log-input1">
					<label htmlFor="phone"></label>
					<input 
						onFocus={this.onFocus}
						placeholder="输入手机号码"
						name="phone"
						id="phone"
						type="text"/>
				</div>
				<div className="log-input2">
					<label htmlFor="checkcode"></label>
					<input
						onFocus={this.onFocus}
						placeholder="填写验证码"
						name="checkcode"
						id="checkcode"
						type="text"/>
					<button className="btn" onClick={this.sendSMS.bind(this)}>发送验证码</button>
				</div>
			</div>
		)
	}
}

PhoneLogin.protTypes = {
	auth: PropTypes.object.isRequired
}
const mapStateToProps = state => {
	return {
		auth: state.auth
	}
}
export default connect(mapStateToProps, {setLoginWay})(PhoneLogin);