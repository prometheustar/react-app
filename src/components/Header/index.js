import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'

class AppHeader extends Component {
	render() {
		const auth = this.props.auth;
		return (
			<div className="app-header-wrap">
				<div className="app-header">
					<h1>漂泊</h1>
					{
						auth.isLogin ?
						(<ul>
							<li>{auth.user.nickname}</li>
							<li>{auth.user.phone}</li>
						</ul>) :
						null
					}
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