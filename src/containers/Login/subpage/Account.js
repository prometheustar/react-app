import React from 'react'
import axios from 'axios'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'

import config from '../../../utils/config.js'
import {setAuthToken, setCurrentUser} from '../../../utils/setAuth'
import {setLoginWay} from '../../../flux/actions/authActions'
import {isPhone, isEmpty, isLength} from '../../../utils/validator'

class Account extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			account: '',
			password: '',
			errors: {}
		}
		this.inputChange = this.inputChange.bind(this);
	}
	componentWillMount() {
		// store 中登录方式修改为 'account'
		if (this.props.auth.loginWay !== 'account') {
			this.props.setLoginWay('account');
		}
	}
	inputChange(e) {
		this.setState({
			[e.target.name]: e.target.value
		});
	}
	formSubmit() {
		let errors = {};
		if (isEmpty(this.state.account)) {
			errors.account = '账号不能为空';
		}else if (!isLength(this.state.password, {min: 6, max: 18})) {
			errors.password = '密码长度 6-18 位';
		}
		if (!isEmpty(errors)) {
			return this.setState({
				errors: {
					...this.state.errors,
					...errors
				}
			})
		}
    let info = {account: this.state.account, password: this.state.password};
		axios.post(config.HOST + '/api/users/login', info)
			.then(res => {
        console.log(res)
				if (!res.data.success) {
					return this.setState({
						errors: {
							...this.state.errors,
							submit:  res.data.message
						}
					})
				}
				// 验证通过
				setAuthToken(res.data.payload.token); // 请求头附加 token
				setCurrentUser(res.data.payload);
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
					<label htmlFor="account"></label>
					<input
						onChange={this.inputChange}
						value={this.state.account}
						placeholder="昵称 / 手机号码"
						name="account"
						id="account"
						type="text"/>
				</div>
        {
          !this.state.errors.account ? null :
          <div>{this.state.errors.account}</div>
        }
				<div className="log-input2">
					<label htmlFor="password"></label>
					<input
						type="password"
						placeholder="密码"
						name="password"
						id="password"
						onChange={this.inputChange}
						value={this.state.password}
					/>
				</div>
        {
          !this.state.errors.password ? null :
          <div>{this.state.errors.password}</div>
        }
				<input type="submit" onClick={this.formSubmit.bind(this)} value="登录"/>
        {
          !this.state.errors.submit ? null :
          <div>{this.state.errors.submit}</div>
        }
			</div>
		)
	}
}
Account.protTypes = {
	auth: PropTypes.object.isRequired,
	setLoginWay: PropTypes.func.isRequired
}
const mapStateToProps = state => {
	return {
		auth: state.auth
	}
}
export default connect(mapStateToProps, {setLoginWay})(Account);
