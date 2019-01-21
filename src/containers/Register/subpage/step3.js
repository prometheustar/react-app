import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'

class Step3 extends Component {
	constructor(props) {
		super(props);
		this.props.changeStep(3);
	}
	render() {
		console.log(this.props);
		const users = this.props.register
		return(
			<div>
				<h1>Step3</h1>
				<h2>{users.nickname},{users.phone}注册成功</h2>
				<Link to="/login">现在登录</Link>
			</div>
		)
	}
}

const mapStateToProps = (state) => ({register: state.register})

function mapActionToProps(dispatch) {
	return {
		changeStep(step) {
			dispatch({
				type: "STEP_CHANGE",
				step
			});
		}
	}
}
export default connect(mapStateToProps, mapActionToProps)(Step3);