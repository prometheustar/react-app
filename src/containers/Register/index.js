import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import axios from 'axios'
import classnames from 'classnames'
import SparkMD5 from 'spark-md5'

import config from '../../utils/config'
import { alertMessageAction } from '../../flux/actions/messageAction'

import './index.scss'
import AppHeader from '../../components/Header/'
import Success from './subpage/Success'

const HOST = config.HOST

var sendingSMS = false
var waitSecond = 59

class Register extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      nickname: '',
      phone: '',
      smscode: '',
      password: '',
      password2: '',
      registerSuccess: false,
      edit: '',
      errors: {}
    }
    this.inputTextChange = this.inputTextChange.bind(this)
    this.inputTextFocus = this.inputTextFocus.bind(this)
    this.inputTextBlur = this.inputTextBlur.bind(this)
  }

  componentDidMount() {
    window.document.title = '优选--账户注册'
  }

  inputTextChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  inputTextFocus(e) {
    this.setState({
      edit: e.target.name,
      errors: {...this.state.errors, [e.target.name]: ''}
    })
  }

  inputTextBlur(e) {
    if (this.state.edit === e.target.name) {
      this.setState({ edit: '' })
    }
  }

  sendSMS(e) {
    if (sendingSMS) {
      return this.props.alertMessageAction(`请等待 ${waitSecond} 秒后重新发送`)
    }
    if (!/^1\d{10}$/.test(this.state.phone)) {
      return this.setState({errors: {...this.state.errors, smscode: '手机号格式有误'}})
    }
    var target = e.currentTarget
    target.style.backgroundColor = 'rgb(226,225,225)'
    target.style.color = 'rgba(148,139,139)'
    waitSecond = 59
    var interval = setInterval(function() {
      target.innerText = `再次发送(${waitSecond})`
      waitSecond--
      if (waitSecond <= 0){
        clearInterval(interval)
        sendingSMS = false
        target.innerText = '获取验证码'
        target.style.backgroundColor = ''
        target.style.color = ''
      }
    }, 1000)
    sendingSMS = true
    axios.post(`${HOST}/api/operator/testsms`, {phone: this.state.phone})
      .then(res => {
        if (!res.data.success) {
          return this.setState({
            errors: {...this.state.errors, smscode: res.data.message}
          })
        }
        this.props.alertMessageAction('短信发送成功，请查收')
        console.log(res.data)
      })
      .catch(err => {
        this.setState({
          errors: {...this.state.errors, smscode: err.message}
        })
      })
  }

  registerSubmit(e) {
    e.preventDefault()
    var errors = {}
    // return console.log(SparkMD5.hash(this.state.password))
    if (!/^[^0-9][\w\W]{2,10}$/.test(this.state.nickname)) {
      errors.nickname = '昵称格式有误'
    }
    if (!/^1\d{10}$/.test(this.state.phone)) {
      errors.phone = '手机号格式有误'
    }
    if (!/^\d{5,6}$/.test(this.state.smscode)) {
      errors.smscode = '验证码格式有误'
    }
    if (!/^[\w,';)(!~·`\/\\{}"<>?+-=_.]{6,25}$/.test(this.state.password)) {
      errors.password = '密码格式有误，6-20位，可包含,\';)(!~·`\/\\{}"<>?+-=_.特殊字符'
    }else if (this.state.password2 !== this.state.password) {
      errors.password2 = '两次输入密码不一致'
    }
    if (this.state.password2 === '') {
      errors.password2 = '请再次输入密码'
    }
    if (Object.keys(errors).length > 0) {
      return this.setState({ errors: errors })
    }
    axios.post(`${HOST}/api/users/register`, {
      nickname: this.state.nickname,
      phone: this.state.phone,
      smscode: this.state.smscode,
      password: this.state.password
    }).then(res => {
      if (!res.data.success) {
        return this.setState({
          errors: {submit: res.data.message}
        })
      }
      // 注册成功
      this.setState({
        registerSuccess: true,
        password: '',
        password2: '',
        smscode: ''
      })
    }).catch(err => {
      this.setState({
        errors: {submit: '发生了错误：' + err.message}
      })
    })
  }

  render() {
    return (
      <div>
        <div id="head0">
          <div id="head1">
            <div className="head_left"><Link to="/"><img src={`${HOST}/image/ui/home_logo.png`} /></Link></div>
            <div className="head_right"><span className="font_sty1">你好，欢迎光临优选！</span><Link to="/login"><span className="font_sty2">请登陆</span></Link><span className="font_sty3">帮助中心</span></div>
          </div>
        </div>
        {
          this.state.registerSuccess ? <Success nickname={this.state.nickname} phone={this.state.phone} /> : <div id="main0">
            <div id="main1">
              <form onSubmit={this.registerSubmit.bind(this)} method="POST">
                <ul>
                  <li><span className="main_font1">优选注册</span></li>
                  <li>
                    <input
                      onChange={this.inputTextChange}
                      onFocus={this.inputTextFocus}
                      onBlur={this.inputTextBlur}
                      value={this.state.nickname}
                      className={classnames("main_li2", {
                        'regi-inp-err': this.state.errors.nickname
                      })} type="text" name="nickname" placeholder="用户名"
                    ></input>
                    {
                      this.state.edit === "nickname" ? <div className="regi-hint">2-10位字符组成，不能以数字开头</div> :
                      this.state.errors.nickname && <div className="regi-err">{this.state.errors.nickname}</div>
                    }
                  </li>
                  <li>
                    <input
                      onChange={this.inputTextChange}
                      onFocus={this.inputTextFocus}
                      onBlur={this.inputTextBlur}
                      value={this.state.phone}
                      className={classnames("main_li2", {
                        'regi-inp-err': this.state.errors.phone
                      })} type="text" name="phone" placeholder="手机号"
                    ></input>
                    {
                      this.state.edit === "phone" ? <div className="regi-hint">输入手机号</div> :
                      this.state.errors.phone && <div className="regi-err">{this.state.errors.phone}</div>
                    }
                  </li>
                  <li className="li_3">
                    <input
                      onChange={this.inputTextChange}
                      onFocus={this.inputTextFocus}
                      onBlur={this.inputTextBlur}
                      value={this.state.smscode}
                      className={classnames("main_li3", {
                        'regi-inp-err': this.state.errors.smscode
                      })} type="text" name="smscode" placeholder="验证码"
                    ></input>
                    <div onClick={this.sendSMS.bind(this)} className="main_yz">获取验证码</div>
                    {
                      this.state.edit === "smscode" ? <div className="regi-hint">输入短信验证码</div> :
                      this.state.errors.smscode && <div className="regi-err">{this.state.errors.smscode}</div>
                    }
                  </li>
                  <li>
                    <input
                      onChange={this.inputTextChange}
                      onFocus={this.inputTextFocus}
                      onBlur={this.inputTextBlur}
                      value={this.state.password}
                      className={classnames("main_li4", {
                        'regi-inp-err': this.state.errors.password
                      })} type="password" name="password" placeholder="密码"
                    ></input>
                    {
                      this.state.edit === "password" ? <div className="regi-hint">6-20位字母数字，可包含,\';)(!~·`\/\\{}"&lf;&gt;?+-=_.特殊字符</div> :
                      this.state.errors.password && <div className="regi-err">{this.state.errors.password}</div>
                    }
                  </li>
                  <li>
                    <input
                      onChange={this.inputTextChange}
                      onFocus={this.inputTextFocus}
                      onBlur={this.inputTextBlur}
                      value={this.state.password2}
                      className={classnames("main_li4", {
                        'regi-inp-err': this.state.errors.password2
                      })} type="password" name="password2" placeholder="确认密码"
                    ></input>
                    {
                      this.state.edit === "password2" ? <div className="regi-hint">请再次输入密码</div> :
                      this.state.errors.password2 && <div className="regi-err">{this.state.errors.password2}</div>
                    }
                  </li>
                  <li><span className="main_li6">点击注册，表示您同意优选<a href="javascript:void(0);" className="main_li6a">《服务协议》</a></span></li>
                  <li>
                    <button type="submit" className="main_li7">同意协议并注册</button>
                    {
                      this.state.errors.submit && <div className="regi-err">{this.state.errors.submit}</div>
                    }
                  </li>
                  <li><div className="main_li8"><span className="main_li8_1">沪ICP备13044278号丨合字B1.B2-20130004丨营业执照</span><span className="main_li8_2">Copyright&copy; 周围 叶谱 唐铭佑 2018-2019，ALL Rights Reserved</span></div></li>
                </ul>
              </form>
            </div>
          </div>
        }

      </div>
    )
  }
}

export default connect(null, { alertMessageAction })(Register)
