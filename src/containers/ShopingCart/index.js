import React from 'react'
import { connect } from 'react-redux'
import { Link, withRouter } from 'react-router-dom'
import axios from 'axios'
import classnames from 'classnames'
import PropTypes from 'prop-types'

import './index.scss'
import config from '../../utils/config'
import socket from '../../utils/socket'
import { setBuyProductsAction } from '../../flux/actions/orderActions'
import { toggleChatAction } from '../../flux/actions/chatActions'
import { intMultiplication, intAdd, transPrice } from '../../utils/tools'

const HOST = config.HOST

class ShopingCart extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      height: 0,
      bodyStatus: 'hide',
      navStatus: 'hide',
      choiceAll: true,
      choiceStores: [],
      choiceProducts: [],
    }
  }

  componentWillMount() {

  }

  componentDidMount() {
    if (typeof(window) === 'object') {
      var _this = this
      this.setState({
        height: document.documentElement.clientHeight
      })
      window.onresize = function() {
        _this.setState({
          height: document.documentElement.clientHeight
        })
      }
    }
  }

  componentWillUnmount() {
    if (typeof(window) === 'object') {
      window.onresize = null
    }
  }

  showCarBody() {
    var interval = -1
    return function() {
      var isHide = this.state.bodyStatus === 'hide'
      var width = isHide ? -280 : 0
      var inter = isHide ? 15 : 20
      var out = isHide ? 300 : 200
      var diff = isHide ? 14 : 28
      var _this = this
      _this.setState({
          bodyStatus: isHide ? 'show' : 'hide',
          navStatus: isHide ? 'show' : 'hide',
      }, function() {
        interval = setInterval(function() {
          width = isHide ? width + diff : width - diff
          _this.refs.shopCarBody.style.marginRight = width + 'px'
        }, inter)
        setTimeout(function() {
          clearInterval(interval)
          _this.refs.shopCarBody.style.marginRight = isHide ? '0px' : '-280px'
        }, out)
      })
    }
  }
  showNav() {
    this.setState({
      navStatus: 'show'
    })
  }
  hideNav() {
    if (this.state.bodyStatus === 'show') return
    this.setState({
      navStatus: 'hide'
    })
  }

  // 显示或隐藏聊天窗口
  toggleChat() {
    toggleChatAction(!this.props.hideChat)
  }

  // 购物车商品数量减一
  numberMinus(product) {
    var timer = 0;
    return function() {
      var now = Date.now()
      if (now - timer > 800) {
        if (product.number - 1 < 1 || socket.status !== 'open') return
        socket.ws.send(JSON.stringify({
          type: 'shop_car_number_minus',
          target: 'koa',
          content: product.shopCarId
        }))
      }
      timer = now
    }
  }

  // 购物车商品数量加一
  numberPlus(product) {
    var timer = 0;
    return function() {
      var now = Date.now()
      if (now - timer > 800) {
        console.log(product)
        if (product.number + 1 > product.amount || socket.status !== 'open') return
        socket.ws.send(JSON.stringify({
          type: 'shop_car_number_plus',
          target: 'koa',
          content: product.shopCarId
        }))
      }
      timer = now
    }
  }

  // 购物车删除商品
  deleteShopProduct(shopCarId) {
    var timer = 0;
    return function() {
      var now = Date.now()
      if (now - timer > 800) {
        if (socket.status !== 'open') return
        socket.ws.send(JSON.stringify({
          type: 'delete_shop_car_product',
          target: 'koa',
          content: shopCarId
        }))
      }
      timer = now
    }
  }

  // 全选单选框改变
  allCheckboxChange(e) {
    if (e.target.checked) {
      this.setState({
        choiceAll: true
      })
    }else {
      this.setState({
        choiceAll: false,
        choiceStores: [],
        choiceProducts: []
      })
    }
  }
  // 商店单选框改变
  storeCheckboxChange(storeId) {
    return function(e) {
      if (e.target.checked) {
        this.setState({
          choiceStores: [...this.state.choiceStores, storeId]
        })
      }else {
        this.setState({
          choiceStores: this.state.choiceStores.filter(i => i !== storeId),
          choiceAll: false,
        })
      }
    }
  }

  // 商品单选框改变
  productCheckboxChange(shopCarId, storeId) {
    return function(e) {
      if (e.target.checked) {
        this.setState({
          choiceProducts: [...this.state.choiceProducts, shopCarId]
        })
      }else {
        this.setState({
          choiceProducts: this.state.choiceProducts.filter(i => i !== shopCarId),
          choiceStores: this.state.choiceStores.filter(i => i !== storeId),
          choiceAll: false,
        })
      }
    }
  }

  // 计算选中商品的数量
  computeChoiceCount() {
    let count = 0  // 购物车选中商品个数
    let price = 0  // 购物车选中商品总价格
    let shopCarProductsLength = 0  // 购物车商品数量
    let shopCar = this.props.auth.shopCar
    for (let i = 0, len = shopCar.length; i < len; i++) {
      shopCarProductsLength += shopCar[i].products.length
      if (this.state.choiceAll || this.state.choiceStores.indexOf(shopCar[i].storeId) !== -1) {
        count += shopCar[i].products.length // 计算个数
        shopCar[i].products.forEach(item => {
          price = intAdd(price, intMultiplication(item.product.price, item.product.number))  // 计算选中价格
        })
        continue
      }
      for (let j = 0, len2 = shopCar[i].products.length; j < len2; j++) {
        if (this.state.choiceProducts.indexOf(shopCar[i].products[j].product.shopCarId) !== -1) {
          count++
          price = intAdd(price, intMultiplication(shopCar[i].products[j].product.price, shopCar[i].products[j].product.number))  // 计算选中价格
        }
      }
    }
    return {count, price, shopCarProductsLength}
  }

  // 点击结算
  cashierShopCar() {
    var shopCar = this.props.auth.shopCar
    var shopCarProductsLength = 0
    for (let i = 0, len = shopCar.length; i < len; i++) {
      shopCarProductsLength += shopCar[i].products.length
    }
    if (shopCarProductsLength === 0 || (!this.state.choiceAll && this.state.choiceProducts.length === 0 && this.state.choiceStores.length === 0)) return // 什么都没选
    var buyProducts = []
    for (let i = 0, len = shopCar.length; i < len; i++) {
      if (this.state.choiceAll || this.state.choiceStores.indexOf(shopCar[i].storeId) !== -1) {
        shopCar[i].products.forEach(item => {
          buyProducts.push({
            ...item.product,
            spec: item.spec
          })
        })
        continue
      }
      for (let j = 0, len2 = shopCar[i].products.length; j < len2; j++) {
        if (this.state.choiceProducts.indexOf(shopCar[i].products[j].product.shopCarId) !== -1) {
          buyProducts.push({
            ...shopCar[i].products[j].product,
            spec: shopCar[i].products[j].spec
          })
        }
      }
    }
    this.props.setBuyProductsAction(buyProducts)
    this.props.history.push('/order')
  }

  render() {
    console.log(this.props.notRead)
    const auth = this.props.auth
    // 未登陆
    if (!this.props.auth.isLogin || !Array.isArray(auth.shopCar)) {
      return (
        <div></div>
      )
    }

    let computeChoice = this.computeChoiceCount.call(this)
    return (
      <div style={{height: this.state.height + 'px'}} className="shopcar">
        <div className={classnames("shopcar-nav", {
           'shopcar-nav-transparent': this.state.navStatus === 'hide'
        })} style={{height: this.state.height + 'px'}}>
          <div className="shopcar-nav-wrap">
            <Link to="/member">
              <div style={{marginTop: this.state.height * 0.3 + 'px'}} className="user-logo">
                <img src={`${HOST}/image/member/avatar/${auth.user.avatar}`} alt=""/>
              </div>
            </Link>
            <div onMouseOver={this.showNav.bind(this)} onMouseLeave={this.hideNav.bind(this)} onClick={this.showCarBody().bind(this)} className={classnames("shop-mab", {'shop-mab-focus': this.state.bodyStatus === 'show'})}>
              <div className="sp-logo"><img src={`${HOST}/image/ui/shopingcar_logo.png`} /></div>
              <div className="sp-font">购物车</div>
              <div className="sp-count">{computeChoice.shopCarProductsLength}</div>
            </div>
            <div onClick={this.toggleChat.bind(this)}>
              <div><img width="35px" height="35px" src={`${HOST}/image/ui/frog.png`} /></div>
              <div>{this.props.notRead}</div>
            </div>
          </div>
        </div>
        {/*购物车商品*/}
        <div ref="shopCarBody"
          className="shopcar-body"
          style={{height: this.state.height + 'px'/*,display: this.state.bodyStatus === 'show' ? 'block' : 'none'*/}}>
          <div className="sc-choice-all-wrap">
            <input checked={this.state.choiceAll} onChange={this.allCheckboxChange.bind(this)} type="checkbox"/>
            <span>全选</span>
          </div>
          <div className="sc-products-wrap" style={{height: Number(this.state.height) - 110 + 'px'}}>
          {
            auth.shopCar.map((item, index) => {
              return (
                <div className="sc-store-wrap" key={index}>
                  <div className="sc-store-title sc-line-box">
                    <div className="sc-line-item">
                      <input checked={this.state.choiceAll || this.state.choiceStores.indexOf(item.storeId) !== -1} onChange={this.storeCheckboxChange(item.storeId).bind(this)} type="checkbox"/>
                    </div>
                    <div className="sc-line-item sc-store-name">{item.storeName}</div>
                  </div>
                  {
                    item.products.map((item, i) => {
                      return (
                        <div className="sc-line-box sc-product-wrap" key={i}>
                          <div className="sc-line-item sc-product-checkbox">
                            <input checked={this.state.choiceAll || this.state.choiceStores.indexOf(item.product.storeId) !== -1 || this.state.choiceProducts.indexOf(item.product.shopCarId) !== -1}
                              onChange={this.productCheckboxChange(item.product.shopCarId, item.product.storeId).bind(this)}
                              type="checkbox"/>
                          </div>
                          <div className="sc-line-item sc-product-logo"><img width="50px" src={`${HOST}/image/goods/logo/${item.product.logo}`} title={item.product.goodName} /></div>
                          <div className="sc-line-item sc-product-spec">{
                            item.spec.map((spec, j) => {
                              if (j > 1) return null // 只显示 2 个分类信息
                              return (
                                <p className="sc-product-spec-item" title={spec.specName + "：" + spec.specValue} key={j}>{spec.specValue}</p>
                              )
                            })
                          }</div>
                          <div className="sc-line-item sc-product-number">{item.product.number}</div>
                          <div className="sc-line-price">￥{transPrice(intMultiplication(item.product.price, item.product.number))}</div>
                          <div className="sc-choice-wrap">
                            <div onClick={this.numberMinus(item.product).bind(this)} className="sc-choice-unlike"><img title="数量减一" src={`${HOST}/image/ui/unlike.png`} alt=""/></div>
                            <div onClick={this.numberPlus(item.product).bind(this)} className="sc-choice-like"><img title="数量加一"  src={`${HOST}/image/ui/like.png`} alt=""/></div>
                            <div onClick={this.deleteShopProduct(item.product.shopCarId).bind(this)} className="sc-choice-delete"><img title="删除" src={`${HOST}/image/ui/delete.png`} alt=""/></div>
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
              )
            })
          }
          </div>
          <div className="sc-Cashier-wrap">
            <div className="sc-Cashier-clear">
              <div className="sc-s-count">已选 {computeChoice.count} 件</div>
              <div className="sc-s-price">￥ {transPrice(computeChoice.price)}</div>
            </div>
            <div onClick={this.cashierShopCar.bind(this)} className={classnames("sc-Cashier", {
              'sc-empty': computeChoice.shopCarProductsLength === 0 || (!this.state.choiceAll && this.state.choiceProducts.length === 0 && this.state.choiceStores.length === 0)
            })}>
              <span>结算</span>
              <div className="sc-Cashier-icon"><img width="18px" height="18px" src={`${HOST}/image/ui/package.png`} /></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

ShopingCart.propTypes = {
  auth: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  setBuyProductsAction: PropTypes.func.isRequired,
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    hideChat: state.chat.hideChat,
    notRead: state.chat.messagesNotRead.reduce(function(prev, next) {
      return prev + next.notRead
    }, 0)
  }
}

export default withRouter(connect(mapStateToProps, { setBuyProductsAction })(ShopingCart))
