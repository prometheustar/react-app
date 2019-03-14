import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'

import './index.scss'
import {setAuthToken, setCurrentUser} from '../../utils/setAuth'
class AppHeader extends Component {
	constructor() {
		super();
		this.state = {

		}
	}
	// 退出
	loginOut() {
		setAuthToken(false); // axios token 头清除，localStorage token清除
		setCurrentUser({}); // dispatch 当前空用户
	}
	render() {
		const auth = this.props.auth;
		const hello = (<ul className="ul-l">
						<li>哈，欢迎来到xx</li>
						<li>
							<Link to="/login">请登录</Link>
						</li>
						<li>
							<Link to="/register">免费注册</Link>
						</li>
					</ul>)
		const userinfo = (<ul className="ul-l">
						<li>Hi，<Link to="/member">{auth.user.nickname}</Link></li>
						<li>
							<span to="/login">积分0</span>
						</li>
						<li>
							<Link to="/">消息0</Link>
						</li>
						<li>
							<a onClick={this.loginOut.bind(this)} href="javascript:void(0)">退出</a>
						</li>
					</ul>)
		return (
			<div className="app-header-wrap">
				<div className="app-header">
					{
						auth.isLogin ?
						userinfo :
						hello
					}
					<ul className="ul-r">
						<li><Link to="/member">我的淘宝</Link></li>
						<li><Link to="/member">购物车0件</Link></li>
						<li>商家支持</li>
					</ul>
				</div>
			</div>
		)
	}
}

AppHeader.propTypes = {
	auth: PropTypes.object.isRequired
}

const mapStateToProps = state => {
	return {
		auth: state.auth
	}
}
export default connect(mapStateToProps, null)(AppHeader);
