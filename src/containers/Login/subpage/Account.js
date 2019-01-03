import React from 'react'
import axios from 'axios'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import {setAuthToken, setCurrentUser} from '../../../utils/setAuth'
import {setLoginWay} from '../../../flux/actions/authActions'

class Account extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			account: '',
			password: '',
			errors: {}
		}
		this.inputChange = this.inputChange.bind(this);
		this.formSubmit = this.formSubmit.bind(this);
	}
	componentWillMount() {
		if (this.props.auth.loginWay !== 'account') {
			this.props.setLoginWay('account');
		}
	}
	inputChange(e) {
		this.setState({
			[e.target.name]: e.target.value
		});
	}
	formSubmit(e) {
		e.preventDefault();
		const info = {nickname: this.state.account, password: this.state.password};
		axios.post(process.env.HOST + '/api/users/login', info)
			.then(res => {
				console.log(res);
				if (!res.data.success) {
					this.setState({
						errors: {
							...this.state.errors,
							...res.data.errors
						}
					});
					return;
				}
				// 验证通过
				setAuthToken(res.data.payload.token); // 请求头附加token
				setCurrentUser(res.data.payload.user);
				this.props.history.push('/');
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
						onFocus={this.onFocus}
						placeholder="输入手机号码"
						name="phone"
						id="phone"
						type="text"/>
				</div>
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
				<input type="submit" onClick={this.formSubmit} value="登录"/>
			</div>
		)
	}
}
Account.protTypes = {
	auth: PropTypes.object.isRequired
}
const mapStateToProps = state => {
	return {
		auth: state.auth
	}
}
export default connect(mapStateToProps, {setLoginWay})(Account);