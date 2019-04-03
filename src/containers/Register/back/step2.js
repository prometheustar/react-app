import React, {Component} from 'react'
import {connect} from 'react-redux'
import axios from 'axios'
import classnames from 'classnames'

import config from '../../../utils/config.js'

class Step2 extends Component {
	constructor(props) {
		super(props);
		this.state = {
			phone: props.register.phone,
			password: '',
			password2: '',
			nickname: '',
			errors: {}
		}
		this.debounce = this.debounce();
		this.validator = this.validator.bind(this);
		this.onChange = this.onChange.bind(this);
		this.nicknameRepeat = this.nicknameRepeat.bind(this);
	}
	componentWillMount() {
		this.props.changeStep(2);
	}
	onChange(e) {
		// 同步值
		var key = e.target.name;
		this.setState({
			[key]: e.target.value
		});
		// 防抖 验证格式
		this.debounce(() => {
			console.log("防抖验证");
			var valid = this.validator(key);
			this.setState({
				errors: {
					...this.state.errors,
					[key]: valid.isLegal ? '' : valid.msg
				}
			}, () => {
				// 格式验证成功, nickname 是否已存在
				key === 'nickname' && valid.isLegal && this.nicknameRepeat();
			});
		});
	}
	nicknameRepeat(callback) {
	// 验证名字重复
		axios.post(config.HOST + '/api/users/nickname', {nickname: this.state.nickname})
			.then(res => {
				if (!res.data.success) {
					callback && callback(false);  // 提交时用,只要结果，防抖验证不用
					return this.setState({
						errors: {
							...this.state.errors,
							nickname: res.data.msg
						}
					});
				}
				this.setState({
					errors: {
						...this.state.errors,
						nickname: ''
					}
				});
				callback && callback(true);
			})
			.catch(err => {
				callback && callback(false);
				this.setState({
					errors: {
						...this.state.errors,
						nickname: err.response.data
					}
				});
			});
	}
	validator(target) {
		var result = {
			key: target,
			isLegal: true,
			msg: ''
		};
		switch (target) {
			case "nickname":
				// 不能以数字开头，长度 2-10 位
				if (!/^[^0-9][\w\W]{1,9}$/.test(this.state.nickname)){
					result.isLegal = false;
					result.msg = "不能以数字开头，长度 2-10 位";
				}
				break;
			case "password2":
				if (this.state.password2 !== this.state.password) {
					result.isLegal = false;
					result.msg = "两次密码不一致";
					break;
				}
			case "password":
				// 0-9 A-z _ . + - # @ ! ^ & $ (6,18)
				if (!/^[\w\d\.\+\-#@!\^\&\$]{6,18}$/.test(this.state.password)) {
					result.isLegal = false;
					result.msg = "密码长度6-18位，可包含0-9 A-z _ . + - # @ ! ^ & $";
				}
				break;
			default:
				result.isLegal = false;
				result.msg = '未定义类型';
				break;
		}
		return result;
	}
	// 防抖函数：停止输入后延迟一秒执行传入函数
	debounce() {
		var timer = null;
		return function (handler) {
			window.clearTimeout(timer);
			timer = window.setTimeout(function () {
				handler && handler();
			}, 1000);
		}
	}
	onSubmit() {
		// 提交，验证所有，发送注册请求
		if (this.validator("nickname").isLegal && this.validator("password").isLegal && this.validator("password2").isLegal) {
			// 验证名字
			this.nicknameRepeat((result) => {
				if (!result) return;
				// 验证成功，进行注册
				const newUser = {
					nickname: this.state.nickname,
					password: this.state.password,
					phone: this.props.register.phone
				}
				axios.post(config.HOST + "/api/users/register", newUser)
					.then(res => {
						if (res.data.success) {
							// 验证通过
							this.props.getUser(newUser); // dispatch NEW_USER
							this.props.history.push('/register/step3');
						}
					})
					.catch(err => {
						this.setState({
							errors: {
								...this.state.errors,
								submit: err.response.data
							}
						});
					});
			});
		}
	}
	render() {
		return (
			<div className="step2">
				<h2>Step2</h2>
				<div className="s2-item">
					<div className="s2-i-left">
						<span className="s2-font1">登录名</span>
					</div>
					<div className="s2-i-right s2-font1">
						{this.state.phone}
					</div>
				</div>
				<div className="s2-item">
					<div className="s2-i-left">
						<span className="s2-font1">请设置登录密码</span>
					</div>
					<div className="s2-i-right s2-font1">
						<span className="s2-font2">登录时验证，保护账号信息</span>
					</div>
				</div>
				<div className="s2-item">
					<div className="s2-i-left">
						<span className="s2-font2">登录密码</span>
					</div>
					<div className="s2-i-right s2-font1">
						<input
							type="password"
							placeholder="设置你的登录密码"
							name="password"
							onChange={this.onChange}
							value={this.state.password}
							className={classnames({
								"border-err": this.state.errors.password
							})}
						/>
						{
							this.state.errors.password &&
							(<div className="register-err">{this.state.errors.password}</div>)
						}
					</div>
				</div>
				<div className="s2-item">
					<div className="s2-i-left">
						<span className="s2-font2">密码确认</span>
					</div>
					<div className="s2-i-right s2-font1">
						<input
							type="password"
							placeholder="再次输入你的密码"
							name="password2"
							onChange={this.onChange}
							value={this.state.password2}
							className={classnames({
								"border-err": this.state.errors.password2
							})}
						/>
						{
							this.state.errors.password2 &&
							(<div className="register-err">{this.state.errors.password2}</div>)
						}
					</div>
				</div>
				<div className="s2-item">
					<div className="s2-i-left">
						<span className="s2-font1">设置会员名</span>
					</div>
				</div>
				<div className="s2-item">
					<div className="s2-i-left">
						<span className="s2-font2">登录名</span>
					</div>
					<div className="s2-i-right s2-font1">
						<input
							type="text"
							placeholder="会员名一旦设置成功，无法修改"
							name="nickname"
							onChange={this.onChange}
							value={this.state.nickname}
							className={classnames({
								"border-err": this.state.errors.nickname
							})}
						/>
						{
							this.state.errors.nickname &&
							(<div className="register-err">{this.state.errors.nickname}</div>)
						}
					</div>
				</div>
				<div className="s2-submit-wrap">
					<button onClick={this.onSubmit.bind(this)} className="s2-submit">提交</button>
					{
						this.state.errors.submit &&
						(<div className="register-err">{this.state.errors.submit}</div>)
					}
				</div>

			</div>
		)
	}
}


function mapStateToProps(state) {
	return {
		register: state.register
	}
}
function mapActionToProps(dispatch) {
	return {
		changeStep(step) {
			dispatch({
				type: "STEP_CHANGE",
				step
			});
		},
		getUser(user) {
			dispatch({
				type: "NEW_USER",
				user
			});
		}
	}
}
export default connect(mapStateToProps, mapActionToProps)(Step2);
