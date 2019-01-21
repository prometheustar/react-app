import './index.scss'
import Step1 from './subpage/step1'	// 注册第一步
import Step2 from './subpage/step2'	// 注册第二步
import Step3 from './subpage/step3'	// 注册成功

import React, {Component} from 'react'
import {Route, Link} from 'react-router-dom'
import {connect} from 'react-redux'

class Register extends Component {
	componentWillMount() {
		this.props.history.push('/register/step1');
	}
	showStep() {
		let registerInfo = this.props.register; // redux 中 register
		let step = '';
		if (registerInfo.step === 3) {
			step = (<h3>1.设置用户名</h3>)
		}else if (registerInfo.step === 2) {
			step = (<h3>2.填写账号信息</h3>)
		}else if (registerInfo.step === 1) {
			step = (<h3>1.设置用户名</h3>)
		}else {
			step = (<h3>look like some error...</h3>)
		}
		return step;
	}
	render() {
		let registerInfo = this.props.register; // redux 中 register
		return (
			<div className="register-wrap">
				<Link to="/login">登录</Link><br/>
				<h1>Register</h1>
				{
					this.showStep.call(this)
				}
				<main>
					<Route exact path="/register/step1" component={Step1} />
					<Route exact path="/register/step2" component={Step2} />
					<Route exact path="/register/step3" component={Step3} />
				</main>
			</div>
		)
	}
}

function mapStateToProps(state) {
	return {
		register: state.register
	}
}
export default connect(mapStateToProps, null)(Register);