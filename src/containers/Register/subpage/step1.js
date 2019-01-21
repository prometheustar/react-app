import React, {Component} from 'react'
import axios from 'axios'
import {Link} from 'react-router-dom'
import {connect} from 'react-redux'

import config from '../../../utils/config.js'

class Step1 extends Component {
	constructor(props) {
		super(props);
		this.state = {
			phone: '',
			isCheck: false,
			smsCode: '',
			sendSMSCode: '',  // 发送的验证码
			errors: {}
		}
		this.validator = this.validator.bind(this);
		this.sendSMS = this.sendSMS.bind(this);
		this.onChange = this.onChange.bind(this);
	}
	componentWillMount() {
		// 进入 Step1 改变 store.register.step = 1 中
		this.props.changeStep(1);
	}
	onChange(e) {
		this.setState({
			[e.target.name]: e.target.value
		});
	}
	validator(phone) {
		if (phone) {
			return /^1[0-9]{10}$/.test(phone);
		}
		return {
			phone: /^1[0-9]{10}$/.test(this.state.phone),
			sms: this.state.sendSMSCode && this.state.smsCode === this.state.sendSMSCode
		}
	}
	sendSMS() {
		if (!this.validator().phone) {
			this.setState({
				errors: {
					...this.state.errors,
					phone: '手机号码格式不正确'
				}
			});
			return;
		}
		this.setState({
			errors: {}
		});
		axios.post(config.HOST + '/api/operator/testsms', {phone: this.state.phone})
			.then(res => {
				if (!res.data.success) {
					this.setState({errors: {...this.state.errors, phone: '服务器忙，稍后重试'}});
					return;
				}
				this.setState({
					sendSMSCode: res.data.payload.smsCode
				}, () => {
					// dispatch 手机号码
					this.props.getPhone(this.state.phone);
				});
				console.log(res.data.payload.smsCode); // 打印验证码
			})
			.catch(err => {
				console.log(err);
				this.setState({
					errors: {
						...this.state.errors,
						phone: err.message
					}
				});
			});
	}
	nextStep() {
		if (!(this.validator(this.props.register.phone) && this.validator().sms)) {
			// 验证不通过
			this.setState({
				errors: {
					...this.state.errors,
					smsCode: '验证码有误'
				}
			});
			return;
		}
		// 验证通过，下一步
		this.props.history.push('/register/step2')
	}
	componentDidMount() {
		// 组件挂载完毕，绑定原生事件
		const _this = this;
		// 鼠标按下
		this.refs.slideBlock.addEventListener("mousedown", slideCheck);
		function slideCheck(e) {
			let start = e.screenX;
			// 滑块滑动总长度
			let width = window.parseInt(window.getComputedStyle(_this.refs.slide, false)["width"]) - 
				window.parseInt(window.getComputedStyle(_this.refs.slideBlock, false)["width"]);
			console.log(width);
			// 鼠标移动
			document.addEventListener("mousemove", mousemove);
			function mousemove(e) {
				let move = e.screenX - start;
				if (0 < move && move <= width) {
					_this.refs.slideBlock.style.left = move + "px";  // 滑块移动
					_this.refs.slideRate.style.width = move + "px";  // 验证块变宽
				}
			}
			// 鼠标抬起
			document.addEventListener("mouseup", mouseup)
			function mouseup(e) {
				console.log("mouseup");
				// 接触监听事件
				_this.refs.slideBlock.removeEventListener("mousemove", mousemove);
				document.removeEventListener("mousemove", mousemove);
				document.removeEventListener("mouseup", mouseup);

				let end = parseInt(_this.refs.slideRate.style.width); // 验证块长度
				console.log(end, width);
				if (end >= width-3) {  // 验证精度
					// "验证成功"
					_this.refs.slideBlock.removeEventListener("mousedown", slideCheck);
					_this.setState({
						isCheck: true
					});
				}else {
					_this.refs.slideBlock.style.left = "0px"; // 滑块还原
					_this.refs.slideRate.style.width = "0px"; // 验证块还原
				}
			}
		}
	}
	render() {
		return (
			<div className="Step1">
				<div className="s1-item phone">
					<div className="prefix">手机号</div>
					<div className="s1-item-body">
						<div className="s1-phone-prefix">
							<span>中国大陆</span>
							<span> +86</span>
						</div>
						<div className="s1-phone-input">
							<input
								type="text"
								placeholder="请输入手机号"
								name="phone"
								onChange={this.onChange}
								value={this.state.phone}
							/>
						</div>
					</div>
				</div>
				{
					this.state.errors.phone && 
					(<p>{this.state.errors.phone}</p>)
				}
				<div className="s1-item">
					<div className="prefix">手机号</div>
					<div className="s1-item-body">
						<div ref="slide" className="slide">
							<p>{this.state.isCheck ? "验证通过" : "请按住滑块，拖动到最右边"}</p>
							<div ref="slideRate" style={{width: 0}} className="slide-rate"></div>
							<div ref="slideBlock" style={{left: 0}} className="slide-block">>></div>
						</div>
					</div>

				</div>
				{
					this.state.isCheck ?
					<div className="s1-item s1-smscode">
						<div className="-prefix">验证码</div>
						<div className="s1-item-body">
							<input 
								type="text"
								placeholder="输入手机验证码"
								name="smsCode"
								onChange={this.onChange}
								value={this.state.smsCode}
							/>
							<button onClick={this.sendSMS}>发送</button>
						</div>
					</div>
					: null
				}
			{/*<Link to="/register/step2">下一步</Link>*/}
				<div><span onClick={this.nextStep.bind(this)}>下一步</span></div>
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
		getPhone(phone) {
			dispatch({
				type: "GET_PHONE",
				phone
			});
		}
	}
}
export default connect(mapStateToProps, mapActionToProps)(Step1);