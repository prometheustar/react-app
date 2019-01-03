import Register from '../Register'
import Login from '../Login'
import AppHeader from '../../components/Header'

import React, {Component} from 'react'
import {Link} from 'react-router-dom'

class Home extends Component {
	render() {
		console.log("Home render...");
		return (
			<div>
				<AppHeader />
				<ul style={{"marginTop": "20px"}}>
					<li>
						<Link to="/register">To Register</Link>
					</li>
					<li>
						<Link to="/login">To Login</Link>
					</li>
				</ul>
			</div>
		)
	}
}

export default Home;