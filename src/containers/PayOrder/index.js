import React from 'react'
import { connect } from 'react-redux'
import { isEmpty } from '../../utils/validator'
import axios from 'axios'
import classnames from 'classnames'
import SparkMD5 from 'spark-md5'
import { transPrice } from '../../utils/tools'
import config from '../../utils/config'

import './index.scss'
import { setRouterLocationAction } from '../../flux/actions/authActions'
import { alertMessageAction } from '../../flux/actions/messageAction'
import { payOrderSuccessAction } from '../../flux/actions/orderActions'
import PayHeader from './subpage/PayHeader'
import Success from './subpage/Success'

const HOST = config.HOST

class PayOrder extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      payway: 'alipay', // 余额 或 支付宝
      property: -1,  // 余额
      smsCode: '',
      errors: {}
    }
    this.myState = {
      smsSending: false,
      second: 0
    }

    this.paywayChange = this.paywayChange.bind(this)
  }

  componentWillMount() {
    if (typeof(window) !== 'object') return;
    /**
     * 判断上一级页面是否 /order，跳到主页
     */
    this.props.setRouterLocationAction('/payorder')
    if (!this.props.isLogin) {
      this.props.history.push('/login')
    }
    axios.get(`${HOST}/api/users/get_property`)
      .then(res => {
        if (!res.data.success) {
          return this.setState({
            errors: {...this.state.errors, wallet: res.data.message}
          })
        }
        this.setState({
          property: res.data.payload,
          errors: {...this.state.errors, wallet: ''}
        })
      })
      .catch(err => {
        this.setState({
          errors: {...this.state.errors, wallet: '服务器忙'}
        })
      })
  }

  componentDidMount() {
    window.document.title = '优选--订单付款'
    if (this.refs.payBody) {
      var _this = this
      this.refs.payBody.style.height = document.documentElement.clientHeight + 'px'
      window.onresize = function() {
        _this.refs.payBody.style.height = document.documentElement.clientHeight + 'px'
      }
    }
  }

  componentWillUnmount() {
    if (typeof window === 'object') {
      window.onresize = null
    }
  }

  paywayChange(e) {
    this.setState({
      payway: e.target.value
    })
  }
  setPayway(way) {
    return function() {
      this.setState({
        payway: way
      })
    }
  }

  SMSInputChange(e) {
    if (!/^\d{0,6}$/.test(e.target.value)) return;
    this.setState({smsCode: e.target.value})
  }

  sendSMS(e) {
    if (this.myState.smsSending) {
      return this.props.alertMessageAction(`验证码发送中`)
    }
    if (this.myState.second > 0) {
      return this.props.alertMessageAction(`请(${this.myState.second})秒后重试`)
    }
    var target = e.currentTarget
    target.style.backgroundColor = "#ccc"
    this.myState.second = 59
    var _this = this
    var interval = setInterval(function() {
      _this.myState.second--
      target.innerText = `再次发送(${_this.myState.second})`
    }, 1000)
    setTimeout(function() {
      clearInterval(interval)
      _this.myState.second = 0
      target.style.backgroundColor = ''
      target.innerText = '发送验证码'
    }, 60000)

    this.myState.smsSending = true
    axios.get(`${HOST}/api/operator/testsms`)
      .then(res => {
        this.myState.smsSending = false
        if (!res.data.success) {
          this.setState({errors: {...this.state.errors, sms: res.data.message}})
        }
        console.log(res.data)
        this.setState({errors: {...this.state.errors, sms: ''}})
      })
      .catch(err => {
          this.myState.smsSending = false
          this.setState({errors: {...this.state.errors, sms: err.message}})
      })
  }

  submitPay() {
    if (this.state.property < parseFloat(this.props.order.payOrder.sumPrice)) {
      return this.props.alertMessageAction('请切换付款方式或充值')
    }

    if (!/\d{5,6}/.test(this.state.smsCode)) {
      return this.setState({ errors: { ...this.state.errors, sms: '验证码格式错误' } })
    }
    var ordernos = this.props.order.payOrder.ordernos
    // console.log(SparkMD5.hash(ordernos.reduce((prev, now) => prev + now, '') + this.props.userId))


    // 1. 获取接口参数签名
   axios.get(`${HOST}/api/order/get_pay_sign`)
      .then(res => {
        if (!res.data.success) {
          return this.setState({ errors: { ...this.state.errors, submit: res.data.message } })
        }
        // 2. 根据签名提交订单
         axios.post(`${HOST}/api/order/property_pay_order`, {
          smsCode: this.state.smsCode,
          ordernos: ordernos,
          sign: SparkMD5.hash(ordernos.reduce((prev, now) => prev + now, '') + res.data.payload.sign)
        })
          .then(res => {
            if (!res.data.success) {
              return this.setState({ errors: {...this.state.errors, submit: res.data.message} })
            }
            // 付款成功
            this.props.payOrderSuccessAction()
          })
          .catch(err => {
            this.setState({ errors: {...this.state.errors, submit: err.message} })
          })
      })
      .catch(err => {
        this.setState({ errors: { ...this.state.errors, submit: err.message } })
      })

  }

  render() {
    if (this.props.order.payStatus === 'success') {
      return (<div  ref="payBody" className="pay-body">
        <PayHeader />
        <Success />
      </div>)
    }
    const payOrder = this.props.order.payOrder
    return (
      <div ref="payBody" className="pay-body">
        <PayHeader />
        {/*
          [isEmpty(buyProducts) ? null : (
            buyProducts.map((item, index) => (
              <div key={index}>
                <div>{item.productName}</div>
                <div>卖家：{item.nickname}</div>
                {
                  // Array.isArray(item.specChoice) && item.specChoice.map((choice, i) => (
                  //   <div key={i}>
                  //     <div>{item.specName[i].specName}: {item.specValue[choice].specValue}</div>
                  //   </div>
                  // ))
                }
              </div>
            ))
          ),
          isEmpty(payOrder) ? null : (
            <div className="pay-sumPrice">{payOrder.sumPrice}</div>
          )]*/
        }
        <div className="pay-wrap">

          <div className="f_wrap">
            <div className="f_l">
              <div className={classnames("f_wrap pay-choice", {
                'pay-selected': this.state.payway === 'alipay'
              })} onClick={this.setPayway('alipay').bind(this)}>
                <div className="f_l pay-checkbox"><input onChange={this.paywayChange} checked={this.state.payway === 'alipay'} name="payway" type="radio" value="alipay"/></div>
                <div className="f_l pay-choi-info">
                  <img className="pay-choi-logo" src={`${HOST}/image/ui/alipay.png`} alt="支付宝扫码支付" title="支付宝扫码支付"/>
                  <span className="pay-choi-f">支付宝扫码支付</span>
                </div>
                <div className="f_l pay-recommend">推荐</div>
              </div>
              <div className={classnames("f_wrap pay-choice", {
                'pay-selected': this.state.payway === 'wallet'
              })} onClick={this.setPayway('wallet').bind(this)}>
                <div className="f_l pay-checkbox"><input onChange={this.paywayChange} checked={this.state.payway === 'wallet'} name="payway" type="radio" value="wallet"/></div>
                <div className="f_l pay-choi-info">
                  <img className="pay-choi-logo" src={`${HOST}/image/ui/wallet.png`} alt="钱包余额支付" title="钱包余额支付"/>
                  <span className="pay-choi-f">钱包余额支付</span>
                </div>
              </div>
            </div>
            <div className="f_r">
              {
                isEmpty(payOrder) ? null : (
                  <div className="pay-sumPrice">
                    <span style={{fontSize: '14px', color: '#444', marginRight: '5px'}}>支付</span>
                    <span>{transPrice(payOrder.sumPrice)}</span>
                  </div>
                )
              }
            </div>
          </div>

          {
            // 支付宝二维码 || 余额支付
            isEmpty(payOrder) ? null : this.state.payway === 'alipay' ? (
              <div>
                {/*支付宝二维码*/}
                <iframe title="alipay" height="560px" width="100%" src={payOrder.alipayURL} frameBorder="0"></iframe>
              </div>
            ) : (
              <div className="pay-wallet">
                { /*余额支付*/
                  this.state.errors.wallet ? (
                    <div className="pay-error">{this.state.errors.wallet}</div>
                  ) : (
                    this.state.property === -1 ? null : (
                      <div className="pay-wallet-wrap">
                        <div className="pay-proper">
                          <span className="pay-p-f1">账户余额：</span>
                          <span className="pay-p-f2">￥{transPrice(this.state.property)}</span>
                        </div>
                        <div className="f_wrap pay-form">
                          <div className="f_l pay-sms">
                            <input onChange={this.SMSInputChange.bind(this)} value={this.state.smsCode} type="text"/>
                          </div>
                          <button onClick={this.sendSMS.bind(this)} className="f_r pay-smsbtn">发送验证码</button>
                        </div>
                        {
                          this.state.errors.sms && <div className="pay-error">{this.state.errors.sms}</div>
                        }
                        <div className="pay-hint">{
                          this.myState.second > 0 ? '请输入6位手机验证码' : `点击发送到${this.props.userPhone}`
                        }</div>
                        <div onClick={this.submitPay.bind(this)} className={classnames({
                          "pay-submit": this.state.property >= parseFloat(this.props.order.payOrder.sumPrice),
                          "pay-suffice": this.state.property < parseFloat(this.props.order.payOrder.sumPrice)
                        })}>{
                          this.state.property < parseFloat(this.props.order.payOrder.sumPrice) ? '余额不足' : '确认付款'
                        }</div>
                        {
                          this.state.errors.submit && <div className="pay-error">{this.state.errors.submit}</div>
                        }

                      </div>
                    )
                  )
                }
              </div>
            )
          }
        </div>

      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    order: state.order,
    userId: state.auth.user.userId,
    isLogin: state.auth.isLogin,
    userPhone: state.auth.user.phone
  }
}
export default connect(mapStateToProps, { setRouterLocationAction, alertMessageAction, payOrderSuccessAction })(PayOrder)
