import React from 'react'
import { connect } from 'react-redux'
import { isEmpty } from '../../utils/validator'
import axios from 'axios'
import config from '../../utils/config'

import { setRouterLocationAction } from '../../flux/actions/authActions'
import PayHeader from './subpage/PayHeader'

const HOST = config.HOST

class PayOrder extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      payway: 'alipay', // 余额 或 支付宝
      property: -1,  // 余额
      errors: {}
    }
    this.paywayChange = this.paywayChange.bind(this)
  }

  componentWillMount() {
    /**
     * 判断上一级页面是否 /order，跳到主页
     */
    this.props.setRouterLocationAction('/payorder')
    if (!this.props.auth.isLogin) {
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
  render() {
    console.log('payprops',this.props)
    console.log('paystate', this.state)
    const payOrder = this.props.order.payOrder
    const buyProducts = this.props.order.buyProducts
    return (
      <div>
        <PayHeader />
        {
          this.props.order.payStatus !== 'success' ? null : (
            <h1>付款成功</h1>
          )
        }
        {
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
            <div key="sumPrice">{payOrder.sumPrice}元</div>
          )]
        }
        <h2>付款方式</h2>
        <div onClick={this.setPayway('alipay').bind(this)}>
          <input onChange={this.paywayChange} checked={this.state.payway === 'alipay'} name="payway" type="radio" value="alipay"/>
          <span>支付宝扫码支付</span>
        </div>
        <div onClick={this.setPayway('wallet').bind(this)}>
          <input onChange={this.paywayChange} checked={this.state.payway === 'wallet'} name="payway" type="radio" value="wallet"/>
          <span>钱包余额支付</span>
        </div>
        {
          isEmpty(payOrder) ? null : this.state.payway === 'alipay' ? (
            <div>
              {/*支付宝二维码*/}
              <iframe height="835px" width="100%" src={payOrder.alipayURL} frameBorder="0"></iframe>
            </div>
          ) : (
            <div>
              { /*余额支付*/
                this.state.errors.wallet ? (
                  <div>{this.state.errors.wallet}</div>
                ) : (
                  this.state.property === -1 ? null : (
                    <div>
                      <div>订单号：{payOrder.orderno}</div>
                      <div>账户余额：{this.state.property}</div>
                      <div><input type="text"/><button>点击发送验证码</button></div>
                    </div>
                  )
                )
              }
            </div>
          )
        }
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    order: state.order,
    auth: state.auth
  }
}
export default connect(mapStateToProps, { setRouterLocationAction })(PayOrder)
