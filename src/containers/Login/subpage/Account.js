import React from 'react'
import axios from 'axios'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import SparkMD5 from 'spark-md5'

import config from '../../../utils/config.js'
import { alertMessageAction } from '../../../flux/actions/messageAction'
import {setAuthToken, setCurrentUser} from '../../../utils/setAuth'
import { isEmpty } from '../../../utils/validator'
const HOST = config.HOST

var loging = false // 判断账户是否在登录中

class Account extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      password: '',
      errors: {}
    }
    this.inputChange = this.inputChange.bind(this);
    this.inputFocus = this.inputFocus.bind(this);
  }

  componentDidMount() {
    window.document.title = '优选--账户登录'
  }

  inputChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  inputFocus(e) {
    this.setState({
      errors: {...this.state.errors, [e.target.name]: ''}
    })
  }

  formSubmit(e) {
    e.preventDefault()
    if (loging) {
      return this.props.alertMessageAction('账户验证中')
    }
    let errors = {};
    if (isEmpty(this.state.account)) {
      errors.account = '账号不能为空';
    }
    if (!/^[\w,';)(!~·`\/\\{}"<>?+-=_.]{6,25}$/.test(this.state.password)) {
      errors.password = '密码格式有误';
    }

    if (Object.keys(errors).length > 0) {
      return this.setState({
        errors: errors
      })
    }
    loging = true
    var target = this.refs.submit
    target.innerText = '登录中。。。'
    let info = {account: this.state.account, password: SparkMD5.hash(this.state.password), hash: 'md5'};
    axios.post(`${HOST}/api/users/login`, info)
      .then(res => {
        loging = false
        target.innerText = '登录'
        if (!res.data.success) {
          return this.setState({
            errors: { submit: res.data.message }
          })
        }
        // 验证通过
        setAuthToken(res.data.payload.token); // 请求头附加 token
        setCurrentUser(res.data.payload.user);
        this.props.history.push(this.props.prev)
      })
      .catch(err => {
        loging = false
        target.innerText = '登录'
        this.setState({
          errors: { submit: err.message || '服务器忙' }
        });
      });
  }
  render() {
    return (
      <div>
        <form className="l-input-wrap" onSubmit={this.formSubmit.bind(this)} method="POST">
          <div className="log-input1">
            <label htmlFor="account" style={{
              background: `url(${HOST}/image/ui/${this.state.errors.account ? 'account_failed.png' : 'account.png'}) center center / 30px 30px no-repeat`
            }}></label>
            <input
              onFocus={this.inputFocus}
              onChange={this.inputChange}
              value={this.state.account}
              placeholder="昵称 / 手机号码"
              name="account"
              id="account"
              type="text"/>
          </div>
          {
            this.state.errors.account && <div className="acc-log-err">{this.state.errors.account}</div>
          }
          <div className="log-input2">
            <label htmlFor="password" style={{
              background: `url(${HOST}/image/ui/${this.state.errors.password ? 'lock_failed.png' : 'lock.png'}) center center / 30px 30px no-repeat`
            }}></label>
            <input
              onFocus={this.inputFocus}
              type="password"
              placeholder="密码"
              name="password"
              id="password"
              onChange={this.inputChange}
              value={this.state.password}
            />
          </div>
          {
            this.state.errors.password && <div className="acc-log-err">{this.state.errors.password}</div>
          }
          <input ref="submit" className="account-log-submit" type="submit" value="登录"/>
          {
            this.state.errors.submit && <div className="acc-log-err acc-log-err-submit">{this.state.errors.submit}</div>
          }
        </form>
      </div>
    )
  }
}
Account.propTypes = {
  auth: PropTypes.object.isRequired,
}
const mapStateToProps = state => {
  return {
    auth: state.auth
  }
}
export default withRouter(connect(mapStateToProps, { alertMessageAction })(Account))
