import React from 'react'
import axios from 'axios'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'

import config from '../../../utils/config.js'
import {setAuthToken, setCurrentUser} from '../../../utils/setAuth'
import {setLoginWay} from '../../../flux/actions/authActions'
import {isPhone, isEmpty} from '../../../utils/validator'

/**
 * 发送手机号到 sms接口，
 * 手机号合法 md5存储验证码并返回，
 * 登录发送手机号验证码，服务端入数据库匹配成功返回 token
 */
class PhoneLogin extends React.Component {
	constructor() {
		super();
		this.state = {
			phone: '',
			sms: '',
			errors: {}
		}
		this.inputChange = this.inputChange.bind(this);
	}
	componentWillMount() {
		// store 中登录方式修改为 'phone'
		if (this.props.auth.loginWay !== 'phone') {
			this.props.setLoginWay('phone');
		}
	}
	inputChange(e) {
		this.setState({
			[e.target.name]: e.target.value
		});
	}
	sendSMS() {
		if (!isPhone(this.state.phone)) {
			return this.setState({
				errors: {
					...this.state.errors,
					phone: '手机号码错误'
				}
			})
		}
		// 格式正确
		if (this.state.errors.phone) {
			this.setState({
				errors: {
					...this.state.errors,
					phone: '',
					sms: ''
				}
			})
		}
		axios.post(config.HOST + "/api/operator/testsms", {phone: this.state.phone})
			.then(({data}) => {
				console.log(data.smsCode);
			})
			.catch(err => {
				console.log(err);
			});
	}
	submit() {
		let errors = false;
		if (!isPhone(this.state.phone)) {
			errors = {phone: '手机号码错误'}
		}else if (isEmpty(this.state.sms)) {
			errors = {sms: '验证码为空'}
		}
		if (errors) {
			return this.setState({
				errors: {
					...this.state.errors,
					...errors
				}
			})
		}
		// 格式验证成功
		const user = {phone: this.state.phone, sms_code: this.state.sms}
		axios.post(config.HOST + '/api/users/phonelogin', user)
			.then(res => {
				console.log(res);
				if (!res.data.success) {
					return this.setState({
						errors: {
							...this.state.errors,
							submit: res.data.message
						}
					})
				}
				// 验证通过
				setAuthToken(res.data.payload.token) // 请求头附加 token
				setCurrentUser(res.data.payload)
        this.props.history.push(this.props.auth.location || '/')
			})
			.catch(err => {
				this.setState({
					errors: {
						...this.state.errors,
						submit: err.response ? err.response.message : '服务器忙'
					}
				});
			});
	}
	render() {
		return (
			<div className="l-input-wrap">
				<div className="log-input1">
					<label htmlFor="phone"></label>
					<input
						placeholder="输入手机号码"
						onChange={this.inputChange}
						value={this.state.phone}
						name="phone"
						id="phone"
						type="text"/>
				</div>
				{
					this.state.errors.phone ?
					<span>{this.state.errors.phone}</span>:
					null
				}
				<div className="log-input2">
					<label htmlFor="sms"></label>
					<input
						placeholder="填写验证码"
						onChange={this.inputChange}
						value={this.state.sms}
						name="sms"
						id="sms"
						type="text"/>
					<button className="btn" onClick={this.sendSMS.bind(this)}>发送验证码</button>
				</div>
				{
					this.state.errors.sms ?
					<span>{this.state.errors.sms}</span>:
					null
				}
				<input type="submit" onClick={this.submit.bind(this)} value="登录"/>
				{
					this.state.errors.submit ?
					<span>{this.state.errors.submit}</span>:
					null
				}
			</div>
		)
	}
}

PhoneLogin.protTypes = {
	auth: PropTypes.object.isRequired,
	setLoginWay: PropTypes.func.isRequired
}
const mapStateToProps = state => {
	return {
		auth: state.auth
	}
}
export default connect(mapStateToProps, {setLoginWay})(PhoneLogin);
