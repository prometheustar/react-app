import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import axios from 'axios'
import classnames from 'classnames'
import socket from '../../utils/socket'
import config from '../../utils/config'
import { isEmpty } from '../../utils/validator'

import { setRouterLocationAction, setAddressAction } from '../../flux/actions/authActions'
import { setPayOrderAction } from '../../flux/actions/orderActions'
import { transPrice, intMultiplication, intAdd, cutString } from '../../utils/tools'

import './index.scss'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

const HOST = config.HOST

class Order extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      choiceAddress: {},
      numbers: [],
      totalPrice: 0,  // 总计金额
      comments: [],
      errors: {}
    }
    this.computeTotal = this.computeTotal.bind(this)
  }
  componentWillMount() {
    // 没有要购买的商品
    if (!Array.isArray(this.props.buyProducts) || this.props.buyProducts.length < 1) {
      // 跳转到上一级
      this.props.history.push(this.props.auth.location || '/')
    }
    this.props.setRouterLocationAction('/order')

    var buyProducts = this.props.buyProducts
    var numbers = [];
    var comments = [];
    var totalPrice = 0;
    for (var i = 0, len = buyProducts.length; i < len; i++) {
      comments[i] = ''
      numbers[i] = buyProducts[i].number
      totalPrice = intAdd(totalPrice, intMultiplication(buyProducts[i].price, buyProducts[i].number))
    }
    // 初始化购买数据量
    this.setState({
      numbers,
      totalPrice,
      comments
    }, function () {
      if (socket.status === 'open') {
        socket.ws.send(JSON.stringify({ type: 'get_address' })) // socket 获取收货地址
      }else {
        axios.get(`${HOST}/api/users/user_address`)  // api 端口获取收货地址
          .then(res => {
            if (res.data.success) {
              setAddressAction(res.data.payload)
            }
          })
          .catch(err => {
            console.log(err)
          })
      }
    })
  }

  componentDidMount() {
    window.document.title = '优选--确认订单'
  }

  componentWillReceiveProps() {
    if (isEmpty(this.state.choiceAddress) && Array.isArray(this.props.auth.address)) {
      console.log(2)
      var defaultAddress = this.props.auth.address.find(i => i.isDefault === 1)
      if (defaultAddress) {
        // console.log(defaultAddress)
        this.setState({
          choiceAddress: defaultAddress
        })
      }
    }
  }

  // 计算总价
  computeTotal(index, number) {
    var buyProducts = this.props.buyProducts
    var totalPrice = 0;
    for (var i = 0, len = buyProducts.length; i < len; i++) {
      totalPrice = intAdd(totalPrice, intMultiplication(buyProducts[i].price, i === index ? number : this.state.numbers[i]))
    }
    return totalPrice
  }

  addressChoice(address) {
    return function() {
      this.setState({
        choiceAddress: address
      })
    }
  }
  numberChange(index, amount) {
    return function(e) {
      var number = e.target.value
      if (!/^[1-9]\d{0,}$/.test(number) || Number(number) > Number(amount))
        return;
      var nums = [...this.state.numbers]
      nums[index] = number
      this.setState({
        numbers: nums,
        totalPrice: this.computeTotal(index, number) // 重新计算总价
      })
    }
  }
  // 数量减减
  numberMinus(index, amount) {
    return function() {
      this.numberChange(index,amount).call(this, {target:{value: Number(this.state.numbers[index])-1}})
    }
  }
  // 数量加加
  numberPlus(index, amount) {
    return function() {
      this.numberChange(index,amount).call(this, {target:{value: Number(this.state.numbers[index])+1}})
    }
  }
  commentChange(index) {
    return function(e) {
      if (e.target.value.length > 200) return;
      var comments = [...this.state.comments]
      comments[index] = e.target.value
      this.setState({
        comments
      })
    }
  }

  commentFocus(e) {
    e.target.style.width = '400px'
  }

  commentBlur(e) {
    e.target.style.width = '200px'
  }

  submitOrder() {
    if (!/^[1-9]\d*$/.test(this.state.choiceAddress._id)) {
      return this.setState({
        errors: {
          ...this.state.errors,
          submitOrder: '请选择收货地址'
        }
      })
    }
    // 商品 Ids, 数量s, detailIds, addressId
    var request = {
      // goodIds: [],
      goodDetailIds: [],
      numbers: this.state.numbers,
      addressId: this.state.choiceAddress._id,
      messages: this.state.comments
    }
    var shopCarIds = []
    for (var i = 0, len = this.props.buyProducts.length; i < len; i++) {
      // request.goodIds.push(this.props.buyProducts[i].goodId)
      request.goodDetailIds.push(this.props.buyProducts[i].goodDetailId)
      if (/^[1-9]\d*$/.test(this.props.buyProducts[i].shopCarId)) {
        shopCarIds.push(this.props.buyProducts[i].shopCarId)
      }
    }
    if (shopCarIds.length > 0) {  // 如果有购物车 Id
      request.shopCarIds = shopCarIds
    }
    axios.post(`${HOST}/api/order/submit_order`, request)
      .then(res => {
        if (!res.data.success) {
          return this.setState({
            errors: {
              ...this.state.errors,
              submitOrder: res.data.message
            }
          })
        }

        this.props.setPayOrderAction(res.data.payload)
        // 跳转到支付页面
        this.props.history.push('/payorder')
      })
      .catch(err => {
        this.setState({
          errors: {
            ...this.state.errors,
            submitOrder: err.message
          }
        })
      })
  }
  render() {
    return (
      <div>
        <Header />
        {/*收货地址*/}
        <div className="worder-wrap">
          <div className="wo-logo-wrap">
            <div className="worder-logo"></div>
            <ul className="order-stepbar">
              <li className="wo-step-i wo-step-1">
                <div className="step-t">拍下商品</div>
                <div className="step-b"></div>
              </li>
              <li className="wo-step-i wo-step-2">
                <div className="step-t">付款</div>
                <div className="step-b">2</div>
              </li>
              <li className="wo-step-i wo-step-3">
                <div className="step-t">确认收货</div>
                <div className="step-b">3</div>
              </li>
              <li className="wo-step-i wo-step-4">
                <div className="step-t">评价</div>
                <div className="step-b">4</div>
              </li>
            </ul>
          </div>
          <h3 className="wo-tit">选择收货地址</h3>
          <div className="wo-add-wrap">
            {
              this.props.auth.address.length === 0 ? <div className="wo-add-info">你还没有收获地址哦！<Link className="wo-linkto-add" to="/member/address">点击添加</Link></div>
              : this.props.auth.address.map((item, index) => (
                <div key={index} className={classnames("wo-add-item-wrap", {
                  'wo-add-item-choi': this.state.choiceAddress._id === item._id
                })}>
                  <div className="wo-add-item" onClick={this.addressChoice(item).bind(this)}>
                    <div className="wo-add-i-recename">
                      <span className="wo-add-i-sub">收货人：</span>
                      <span className="wo-add-i-body">{item.receiveName}</span>
                      <span className="wo-add-i-sub">（收）</span>
                    </div>
                    <p title={item.address} className="wo-add-i-address">
                      <span className="wo-add-i-body">{cutString(item.address, 32)}</span>
                    </p>
                    <div className="wo-add-i-pcode">
                      <span className="wo-add-i-sub">邮编：</span>
                      <span className="wo-add-i-body">{item.postcode}</span>
                    </div>
                    <div className="wo-add-i-phone">
                      <span className="wo-add-i-sub">收货人电话：</span>
                      <span className="wo-add-i-body">{item.phone}</span>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
          <Link className="wo-add-address" to="/member/address">添加收货地址</Link>
          <h3 className="wo-affirm">确认订单信息</h3>
          {
            this.props.buyProducts.map((item, index) => {
              return (
                <div className="wo-order-wrap" key={index}>
                  <div className="wo-o-i wo-o-storename">店铺：{item.storeName}</div>
                  <div className="wo-o-i wo-o-logo"><img width="50px" height="50px" src={item.logo ? `${HOST}/image/goods/logo/${item.logo}_210x210q90.jpg` : `${HOST}/api/goods/product_logo?goodId=${item.goodId}`} alt=""/></div>
                  <p title={item.goodName} className="wo-o-i wo-o-prod-name">{cutString(item.goodName, 29)}</p>
                  <div className="wo-o-i wo-o-spec-wrap">
                  {
                    Array.isArray(item.spec) ? item.spec.map((spec, index) => {
                      return (
                        // 顺序排列 index = config -1
                        <div className="wo-o-spec" key={index}>{cutString(spec.specName, 4)}：{cutString(spec.specValue, 7)}</div>
                      )
                    }) : null
                  }
                  </div>
                  <div className="wo-o-i wo-o-price">单价：{transPrice(item.price)}</div>
                  <div className="wo-o-i wo-o-operat">
                    <span className="wo-o-minus" onClick={this.numberMinus(index, item.amount).bind(this)}>-</span>
                    <input className="wo-o-num" onChange={this.numberChange(index, item.amount).bind(this)} value={this.state.numbers[index]} type="text"/>
                    <span className="wo-o-plus" onClick={this.numberPlus(index, item.amount).bind(this)}>+</span>
                  </div>
                  <div className="wo-o-i wo-o-amount">库存：{item.amount}</div>
                  <div className="wo-o-i wo-o-subtotal"><span>小计：</span><span className="wo-o-total">￥{transPrice(intMultiplication(item.price, this.state.numbers[index]))}</span></div>
                  <div className="wo-o-comment">
                    <span className="wo-add-i-sub">给卖家留言：</span>
                    <input onFocus={this.commentFocus} onBlur={this.commentBlur} className="wo-o-com-inp" onChange={this.commentChange(index).bind(this)} value={this.state.comments[index]} placeholder="选填，请先和卖家商议一致" type="text"/>
                  </div>
                </div>
              )
            })
          }
          <div className="wo-o-submit-wrap">
            <div className="wo-o-float-r">
              <div className="wo-o-sub-price-wrap">
                <div className="wo-o-sub-shadow">
                  <div className="wo-o-sumprice">
                    <span className="wo-o-sub-itit">实付款：</span>
                    <span className="wo-o-sub-ib">￥{transPrice(this.state.totalPrice)}</span>
                  </div>
                  <p className="wo-o-sub-i">
                    <span className="wo-o-sub-itit">寄送至：</span>
                    <span className="wo-o-sub-ib">{this.state.choiceAddress.address}</span>
                  </p>
                  <p className="wo-o-sub-i">
                    <span className="wo-o-sub-itit">收货人：</span>
                    <span className="wo-o-sub-ib">{this.state.choiceAddress.receiveName}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="wo-sub-btn-wrap">
              <button className="wo-o-submit" onClick={this.submitOrder.bind(this)}>提交订单</button>
            </div>
            {
              this.state.errors.submitOrder && (
                <div className="wo-o-err-wrap">
                  <div className="wo-o-err">{this.state.errors.submitOrder}</div>
                </div>
              )
            }
          </div>
        </div>
        <Footer />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    buyProducts: state.order.buyProducts || []
  }
}
Order.propTypes = {
  auth: PropTypes.object.isRequired,
  buyProducts: PropTypes.array.isRequired
}
export default connect(mapStateToProps, { setRouterLocationAction, setPayOrderAction })(Order)
