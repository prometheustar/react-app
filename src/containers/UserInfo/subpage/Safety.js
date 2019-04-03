import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import axios from 'axios'

import config from '../../../utils/config'
import { isEmail, isPhone } from '../../../utils/validator'
const HOST = config.HOST

class Safety extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      edit: '',  // email or phone or success or password
      newEmail: '',
      newPhone: '',
      newPhone2: '',
      smsCode1: '',
      smsCode2: '',
      password: '',
      newPassword: '',
      smsCode3: '',
      smsState: 'normal', // wait or normal
      property: 0,
      pay: 100,  // 充值金额
      showProperty: false,
      errors: {}
    }
  }

  // 切换修改手机和修改邮箱
  editChange(_, edit) {
    this.setState({
      edit: edit,
      smsState: 'normal'
    })
  }

  editInputChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  // 发短信
  sendSMS(e) {
    if (this.state.smsState !== 'normal') return;
    const btn = e.target
    var _this = this
    axios.get(`${HOST}/api/operator/testsms`)
      .then(res => {
        console.log(res.data)
        if (res.data.success) {
          this.setState({smsState: 'wait'}, function() {
            var count = 60
            var interval = setInterval(function() {
              count--
              if (btn)
                btn.innerText = `重发 ${count}...`
              if (count == 0) {
                clearInterval(interval)
                _this.setState({smsState: 'normal'}, function() {
                  if (btn)
                    btn.innerText = '点击发送';
                })
              }
            }, 1000)
          })
        }else {
          this.setState({
            errors: {...this.state.errors, [btn.name]: res.data.message}
          })
        }
      })
      .catch(err => {
        this.setState({
          errors: {...this.state.errors, [btn.name]: err.message}
        })
      })
  }

  // 修改邮箱
  editEmailSubmit() {
    var errors = {}
    if (!isEmail(this.state.newEmail)) {
      errors.newEmail = "邮箱格式有误"
    }
    if (!/^\d{5,6}$/.test(this.state.smsCode1)) {
      errors.smsCode1 = '验证码有误'
    }
    if (Object.keys(errors).length > 0) {
      return this.setState({
        errors
      })
    }
    axios.post(`${HOST}/api/users/modify_safety`, {
      newEmail: this.state.newEmail,
      smsCode: this.state.smsCode1,
    }).then(res => {
      if (res.data.success) {
        return this.setState({
          edit: 'success',
          newEmail: '',
          smsCode1: '',
          errors: {}
        })
      }
      this.setState({
        errors: {...this.state.errors, emailSubmit: res.data.message}
      })
    }).catch(err => {
      this.setState({
        errors: {...this.state.errors, phoneSubmit: err.message}
      })
    })
  }

  // 修改手机
  editPhoneSubmit() {
    var errors = {}
    if (!isPhone(this.state.newPhone)) {
      errors.newPhone = '手机格式有误'
    }
    if (this.state.newPhone !== this.state.newPhone2) {
      errors.newPhone2 = '两次输入不一致'
    }
    if (!/^\d{5,6}$/.test(this.state.smsCode2)) {
      errors.smsCode2 = '验证码有误'
    }
    if (Object.keys(errors).length > 0) {
      return this.setState({
        errors
      })
    }
    axios.post(`${HOST}/api/users/modify_safety`, {
      newPhone: this.state.newPhone,
      smsCode: this.state.smsCode2
    }).then(res => {
      if (!res.data.success) {
        return this.setState({
          errors: {...this.state.errors, phoneSubmit: res.data.message}
        })
      }
      this.setState({
        edit: 'success',
        newPhone: '',
        newPhone2: '',
        smsCode2: '',
        errors: {}
      })
    }).catch(err => {
      this.setState({
        errors: {...this.state.errors, phoneSubmit: err.message}
      })
    })
  }

  // 修改密码
  editPasswordSubmit() {
    var errors = {}
    if (!/^[\w,';)(!~·`\/\\{}"<>?+-=_.]{6,25}$/.test(this.state.password)) {
      errors.password = '密码格式有误，6-20位，可包含,\';)(!~·`\/\\{}"<>?+-=_.特殊字符'
    }
    if (!/^[\w,';)(!~·`\/\\{}"<>?+-=_.]{6,25}$/.test(this.state.newPassword)) {
      errors.newPassword = '密码格式有误，6-20位，可包含,\';)(!~·`\/\\{}"<>?+-=_.特殊字符'
    }
    if (!/^\d{5,6}$/.test(this.state.smsCode3)) {
      errors.smsCode3 = '验证码有误'
    }
    if (Object.keys(errors).length > 0) {
      return this.setState({
        errors
      })
    }
    axios.post(`${HOST}/api/users/modify_safety`, {
      password: this.state.password,
      newPassword: this.state.newPassword,
      smsCode: this.state.smsCode3
    }).then(res => {
      if (!res.data.success) {
        return this.setState({
          errors: {...this.state.errors, passwordSubmit: res.data.message}
        })
      }
      this.setState({
        edit: 'success',
        password: '',
        newPassword: '',
        smsCode3: '',
        errors: {}
      })
    })
    .catch(err => {
      this.setState({
        errors: {...this.state.errors, passwordSubmit: err.message}
      })
    })
  }

  // 立即充值
  paySubmit() {
    console.log(this.state.pay)
  }

  // 查看余额
  checkProperty() {
    if (this.state.showProperty) return;
    if (!this.state.property) {
      axios.get(`${HOST}/api/users/get_property`)
        .then(res => {
          if (!res.data.success) {
            this.setState({
              errors: {...this.state.errors, property: res.data.message}
            })
          }
          this.setState({
            showProperty: true,
            property: res.data.payload
          })
        })
        .catch(err => {
          this.setState({
            errors: {...this.state.errors, property: err.message}
          })
        })
    }
  }

  render() {
    return (
      <div className="user-safe-wrap">
        <div className="uis-title">你的基础信息</div>
        <div>
          <div className="uis-item">
            <span>会员名：</span>
            <span>{this.props.user.nickname}</span>
          </div>
          <div className="uis-item">
            <span>登录邮箱：</span>
            <span>{this.props.user.email || '空'}</span>
            <span className="uis-i-modify" onClick={this.editChange.bind(this, null, "email")}>修改邮箱</span>
          </div>
          <div className="uis-item">
            <span>绑定手机：</span>
            <span>{this.props.user.phone}</span>
            <span className="uis-i-modify" onClick={this.editChange.bind(this, null, "phone")}>修改手机</span>
          </div>
          <div className="uis-item">
            <span>我的密码：</span>
            <span className="uis-i-modify" onClick={this.editChange.bind(this, null, "password")}>修改密码</span>
          </div>
          <div className="uis-item">
            <span>账户余额：</span>
            {
              this.state.showProperty
              ? <span className="uis-i-property">￥{this.state.property}</span>
              : <span onClick={this.checkProperty.bind(this)} className="uis-i-modify">点击查看</span>
            }
            <span onClick={this.editChange.bind(this, null, "pay")} className="uis-i-modify">立即充值</span>
          </div>
          {
            this.state.errors.property && <div className="tit-err">{this.state.errors.property}</div>
          }
        </div>
        <div className="uis-edit-wrap">
          {
            this.state.edit === 'email' ? (  // 修改邮箱
              <div>
                <div className="uis-title">修改您的邮箱</div>
                <div className="uis-e-content uis-e-email">
                {
                  /*this.props.user.email && <div className="uis-item uis-edit-item">
                    <label htmlFor="old-email">*旧的邮箱：</label>
                    <input onChange={this.editInputChange.bind(this)} name="oldEmail" value={this.state.oldEmail} className="uis-modify-text" id="old-email" type="text"/>
                  </div>*/
                }
                  <div className="uis-item uis-edit-item">
                    <label htmlFor="new-email">*新的邮箱：</label>
                    <input onChange={this.editInputChange.bind(this)} name="newEmail" value={this.state.newEmail}  className="uis-modify-text" id="new-email" type="text"/>
                  </div>
                  {
                    this.state.errors.newEmail && <div className="form-err">{this.state.errors.newEmail}</div>
                  }
                  <div className="uis-sms-wrap">
                    <div className="uis-sms-item"><label htmlFor="sms-code1">*验证码：</label></div>
                    <div className="uis-sms-item">
                      <input onChange={this.editInputChange.bind(this)} name="smsCode1" value={this.state.smsCode1}  id="sms-code1" placeholder={'发送到' + this.props.user.phone} className="uis-modify-sms" type="text"/>
                    </div>
                    <div onClick={this.sendSMS.bind(this)} name="smsCode1" className="uis-sms-btn uis-sms-item">点击发送</div>
                  </div>
                  {
                    this.state.errors.smsCode1 && <div className="form-err">{this.state.errors.smsCode1}</div>
                  }
                  <div className="uis-btn-submit"><button onClick={this.editEmailSubmit.bind(this)}>提交</button></div>
                  {
                    this.state.errors.emailSubmit && <div className="form-err">{this.state.errors.emailSubmit}</div>
                  }
                </div>
              </div>
            ) : this.state.edit === 'phone' ? (  // 修改手机号码
              <div>
                <div className="uis-title">修改您的手机</div>
                <div className="uis-e-content uis-e-phone">
                  <div className="uis-item uis-edit-item">
                    <label htmlFor="new-phone">*新的手机号码：</label>
                    <input onChange={this.editInputChange.bind(this)} name="newPhone" value={this.state.newPhone} className="uis-modify-text" id="new-phone" type="text"/>
                  </div>
                  {
                    this.state.errors.newPhone && <div className="form-err">{this.state.errors.newPhone}</div>
                  }
                  <div className="uis-item uis-edit-item">
                    <label htmlFor="new-phone2">*请再次输入以确认：</label>
                    <input onChange={this.editInputChange.bind(this)} name="newPhone2" value={this.state.newPhone2} className="uis-modify-text" id="new-phone2" type="text"/>
                  </div>
                  {
                    this.state.errors.newPhone2 && <div className="form-err">{this.state.errors.newPhone2}</div>
                  }
                  <div className="uis-sms-wrap">
                    <div className="uis-sms-item"><label htmlFor="sms-code2">*验证码：</label></div>
                    <div className="uis-sms-item">
                      <input id="sms-code2" onChange={this.editInputChange.bind(this)} value={this.state.smsCode2} name="smsCode2" placeholder={'发送到' + this.props.user.phone} className="uis-modify-sms" type="text"/>
                    </div>
                    <div onClick={this.sendSMS.bind(this)} name="smsCode2" className="uis-sms-btn uis-sms-item">点击发送</div>
                  </div>
                  {
                    this.state.errors.smsCode2 && <div className="form-err">{this.state.errors.smsCode2}</div>
                  }
                  <div className="uis-btn-submit"><button onClick={this.editPhoneSubmit.bind(this)}>提交</button></div>
                  {
                    this.state.errors.phoneSubmit && <div className="form-err">{this.state.errors.phoneSubmit}</div>
                  }
                </div>
              </div>
            ): this.state.edit === 'password' ? (  // 修改密码
              <div>
                <div className="uis-title">修改您的密码</div>
                <div className="uis-e-content uis-e-phone">
                  <div className="uis-item uis-edit-item">
                    <label htmlFor="password">*输入当前密码：</label>
                    <input onChange={this.editInputChange.bind(this)} name="password" value={this.state.password} className="uis-modify-text" id="password" type="password"/>
                  </div>
                  {
                    this.state.errors.password && <div className="form-err">{this.state.errors.password}</div>
                  }
                  <div className="uis-item uis-edit-item">
                    <label htmlFor="newPassword">*输入新的密码：</label>
                    <input onChange={this.editInputChange.bind(this)} name="newPassword" value={this.state.newPassword} className="uis-modify-text" id="newPassword" type="password"/>
                  </div>
                  {
                    this.state.errors.newPassword && <div className="form-err">{this.state.errors.newPassword}</div>
                  }
                  <div className="uis-sms-wrap">
                    <div className="uis-sms-item"><label htmlFor="sms-code3">*验证码：</label></div>
                    <div className="uis-sms-item">
                      <input id="sms-code3" onChange={this.editInputChange.bind(this)} value={this.state.smsCode3} name="smsCode3" placeholder={'发送到' + this.props.user.phone} className="uis-modify-sms" type="text"/>
                    </div>
                    <div onClick={this.sendSMS.bind(this)} name="smsCode3" className="uis-sms-btn uis-sms-item">点击发送</div>
                  </div>
                  {
                    this.state.errors.smsCode3 && <div className="form-err">{this.state.errors.smsCode3}</div>
                  }
                  <div className="uis-btn-submit"><button onClick={this.editPasswordSubmit.bind(this)}>提交</button></div>
                  {
                    this.state.errors.passwordSubmit && <div className="form-err">{this.state.errors.passwordSubmit}</div>
                  }
                </div>
              </div>
            ) : this.state.edit === 'pay' ? (
              <div>
                <div className="uis-title">余额充值</div>
                <div className="uis-item uis-edit-item">
                  <label htmlFor="pay">*输入充值金额(￥)：</label>
                  <input onChange={this.editInputChange.bind(this)} name="pay" value={this.state.pay} className="uis-modify-text uis-pay-test" id="pay" type="number"/>
                </div>
                {
                  this.state.errors.pay && <div className="form-err">{this.state.errors.pay}</div>
                }
                <div className="uis-btn-submit uis-btn-pay"><button onClick={this.paySubmit.bind(this)}>立即付款</button></div>
              </div>
            ) : this.state.edit === 'success' ? (
              <h3>修改成功</h3>
            ) : null
          }
        </div>
      </div>
    )
  }
}

Safety.propTypes = {
  user: PropTypes.object.isRequired
}


const mapStateToProps = state => ({
   user: state.auth.user || {}
 })

export default connect(mapStateToProps)(Safety)
