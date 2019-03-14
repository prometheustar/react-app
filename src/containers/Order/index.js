import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import axios from 'axios'
import config from '../../utils/config'

import { setRouterLocationAction } from '../../flux/actions/authActions'
import { setPayOrderAction } from '../../flux/actions/orderActions'
import Header from '../../components/Header'
import { transPrice, intMultiplication, intAdd } from '../../utils/tools'

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
    console.log(this.props)
    // 没有要购买的商品
    if (!Array.isArray(this.props.order.buyProducts) || this.props.order.buyProducts.length < 1) {
      // 跳转到上一级
      this.props.history.push(this.props.auth.location || '/')
    }
    this.props.setRouterLocationAction('/order')
    // 判断是否登录，判断收货地址
    if (!this.props.auth.isLogin && !this.props.auth.isVerify) {
      return this.props.history.push('/login')
    }
    var buyProducts = this.props.order.buyProducts
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
    })
  }
  // 计算总价
  computeTotal(index, number) {
    var buyProducts = this.props.order.buyProducts
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
    for (var i = 0, len = this.props.order.buyProducts.length; i < len; i++) {
      // request.goodIds.push(this.props.order.buyProducts[i].goodId)
      request.goodDetailIds.push(this.props.order.buyProducts[i].goodDetailId)
      if (/^[1-9]\d*$/.test(this.props.order.buyProducts[i].shopCarId)) {
        shopCarIds.push(this.props.order.buyProducts[i].shopCarId)
      }
    }
    if (shopCarIds.length > 0) {  // 如果有购物车 Id
      request.shopCarIds = shopCarIds
    }
    console.log(request)
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
        <h3>选择收货地址</h3>
        <div>
          {
            this.props.auth.address.map((item, index) => (
              <div onClick={this.addressChoice(item).bind(this)} key={index}>
                <div>{item.receiveName}</div>
                <div>{item.address}</div>
                <div>{item.postcode}</div>
                <div>{item.phone}</div>
              </div>
            ))
          }
          <Link to="/member/address"><div>添加收货地址</div></Link>
        </div>
        <h3>确认订单信息</h3>
        {
          this.props.order.buyProducts.map((item, index) => {
            return (
              <div key={index}>
                <div>{item.storeName}, {item.nickname}</div>
                <div><img width="50px" height="50px" src={item.logo ? `${HOST}/image/goods/logo/${item.logo}` : `${HOST}/api/goods/product_logo?goodId=${item.goodId}`} alt=""/></div>
                <div>{item.goodName}</div>
                {
                  Array.isArray(item.spec) ? item.spec.map((spec, index) => {
                    return (
                      // 顺序排列 index = config -1
                      <div key={index}>{spec.specName}：{spec.specValue}</div>
                    )
                  }) : null
                }
                <div>单价{transPrice(item.price)}</div>
                <div>
                  <span onClick={this.numberMinus(index, item.amount).bind(this)}>-</span>
                  数量<input onChange={this.numberChange(index, item.amount).bind(this)} value={this.state.numbers[index]} type="text"/>
                  <span onClick={this.numberPlus(index, item.amount).bind(this)}>+</span>
                </div>
                <div>库存：{item.amount}</div>
                <div>小计{transPrice(intMultiplication(item.price, this.state.numbers[index]))}</div>
                <div>给卖家留言：<input onChange={this.commentChange(index).bind(this)} value={this.state.comments[index]} type="text"/></div>
              </div>
            )
          })
        }
        <div>总计：{transPrice(this.state.totalPrice)}</div>
        <button onClick={this.submitOrder.bind(this)}>提交订单</button>
        {
          this.state.errors.submitOrder && (
            <div>{this.state.errors.submitOrder}</div>
          )
        }
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    order: state.order
  }
}
Order.propTypes = {
  auth: PropTypes.object.isRequired,
  order: PropTypes.object.isRequired
}
export default connect(mapStateToProps, { setRouterLocationAction, setPayOrderAction })(Order)
