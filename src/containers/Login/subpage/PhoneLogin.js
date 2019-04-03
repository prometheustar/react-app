import React from 'react'
import axios from 'axios'
import {connect} from 'react-redux'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'

import config from '../../../utils/config.js'
import {setAuthToken, setCurrentUser} from '../../../utils/setAuth'
import {isPhone, isEmpty} from '../../../utils/validator'

/**
 * 发送手机号到 sms接口，
 * 手机号合法 md5存储验证码并返回，
 * 登录发送手机号验证码，服务端入数据库匹配成功返回 token
 */
const HOST = config.HOST

var waitSMS = 59
var sendingSMS = false

class PhoneLogin extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			phone: '',
			sms: '',
			errors: {}
		}
		this.inputChange = this.inputChange.bind(this);
	}

	inputChange(e) {
		this.setState({
			[e.target.name]: e.target.value
		});
	}

	sendSMS(e) {
    if (sendingSMS) {
      return this.props.alertMessageAction(`请 ${waitSMS} 秒后重试`)
    }
		if (!isPhone(this.state.phone)) {
			return this.setState({
				errors: {
					...this.state.errors,
					phone: '手机号码错误'
				}
			})
		}
    var target = e.currentTarget
    waitSMS = 59
    sendingSMS = true
    target.style.backgroundColor = '#eee'
    var interval = setInterval(function() {
      target.innerText = `再次发送(${waitSMS})`
      waitSMS --
      if (waitSMS === 0) {
        clearInterval(interval)
        target.innerText = '发送验证码'
        target.style.backgroundColor = ''
      }
    }, 1000)
		axios.post(config.HOST + "/api/operator/testsms", {phone: this.state.phone})
			.then(({data}) => {
        console.log(data);
        if (!data.success) {
          return this.setState({
            errors: {...this.state.errors, sms: data.message}
          })
        }
        this.props.alertMessageAction('发送成功请查收验证码')
			})
			.catch(err => {
        this.setState({
          errors: {...this.state.errors, msm: err.message || 'server busy'}
        })
			});
	}
	submit() {
		let errors = {};
		if (!isPhone(this.state.phone)) {
			errors.phone = '手机号格式有误'
		}
    if (!/^[1-9]\d{5}$/.test(this.state.sms)) {
			errors.sms = '验证码格式有误'
		}
		if (Object.keys(errors).length > 0) {
			return this.setState({
				errors: errors
			})
		}
		// 格式验证成功
		const user = {phone: this.state.phone, sms_code: this.state.sms}
		axios.post(config.HOST + '/api/users/phonelogin', user)
			.then(res => {
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
				setCurrentUser(res.data.payload.user)
        this.props.history.push(this.props.prev)
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
					<label htmlFor="phone" style={{
              background: `url(${HOST}/image/ui/${this.state.errors.phone ? 'mobile_failed.png' : 'mobile.png'}) center center / 30px 30px no-repeat`
            }}></label>
					<input
						placeholder="输入手机号码"
						onChange={this.inputChange}
						value={this.state.phone}
						name="phone"
						id="phone"
						type="text"/>
				</div>
				{
					this.state.errors.phone && <div className="acc-log-err">{this.state.errors.phone}</div>
				}
				<div className="log-input2">
					<label htmlFor="sms" style={{
              background: `url(${HOST}/image/ui/${this.state.errors.sms ? 'lock_failed.png' : 'lock.png'}) center center / 30px 30px no-repeat`
            }}></label>
					<input
						placeholder="填写验证码"
						onChange={this.inputChange}
						value={this.state.sms}
						name="sms"
						id="sms"
						type="text"/>
					<button className="log-sendsms" onClick={this.sendSMS.bind(this)}>发送验证码</button>
				</div>
				{
					this.state.errors.sms && <div className="acc-log-err">{this.state.errors.sms}</div>
				}
				<input type="submit" className="account-log-submit" onClick={this.submit.bind(this)} value="登录"/>
				{
					this.state.errors.submit &&  <div className="acc-log-err acc-log-err-submit">{this.state.errors.submit}</div>
				}
			</div>
		)
	}
}

PhoneLogin.propTypes = {
	auth: PropTypes.object.isRequired
}
const mapStateToProps = state => {
	return {
		auth: state.auth
	}
}
export default withRouter(connect(mapStateToProps)(PhoneLogin))
