import React from 'react'
import { connect } from 'react-redux'
import { Link, withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import config from '../../../utils/config'
import { transPrice, transURL } from '../../../utils/tools'

import { setBuyProductsAction } from '../../../flux/actions/orderActions'
import { alertMessageAction } from '../../../flux/actions/messageAction'
import socket from '../../../utils/socket'

const HOST = config.HOST

var initShopCar = true  // 记录是第一次更新购物车

class Spec extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      smaillx: 0,
      smailly: 0,
      bigImg: false, // 是否展示大图
      showMustChoice: false,
      selectImg: props.smaillPicture[0].link,
      nowPrice: 99999,
      allAmount: 0, // 商品总库存
      specChoice: [],  // 选中的属性组合
      choiceProductDetail: {},  // 选中属性组合的商品详情
      choiceNumber: 1,
      specConfig: [] // 重新组合后的属性关系映射
    }
    this.specValueClick = this.specValueClick.bind(this)
    this.onSmaillMouseOver = this.onSmaillMouseOver.bind(this)
  }

  componentWillMount() {
    if (this.props.shopCar.length > 0) { initShopCar = false } // 购物车已初始化
    // 重新组合属性关系映射
    var config = this.props.specConfig
    var newConfig = []
    if (Array.isArray(config)) {
      for (var j = 0; j < config.length; j++) {
        if (newConfig[config[j].detailIndex - 1] === undefined) {
           newConfig[config[j].detailIndex - 1] = []
        }
        newConfig[config[j].detailIndex - 1][config[j].specNameIndex-1] = config[j].specValueIndex
      }
      // 计算总库存
      var allAmount = 0
      for (var i = 0, len = this.props.goodDetail.length; i < len; i++) {
        allAmount += this.props.goodDetail[i].amount
      }
    }
    // 删除库存为 0 属性
    this.setState({
      nowPrice: this.props.goodInfo.nowPrice || 99999,
      specConfig: newConfig,
      allAmount: allAmount,
      selectImg: this.props.smaillPicture[0].link,
      // 商品没有属性分类
      choiceProductDetail: Array.isArray(this.props.specName) && this.props.specName.length > 0 ? {} : this.props.goodDetail[0]
    })
  }

  componentDidMount() {
    var wrap = document.getElementsByClassName('spec-wrap')[0]
    var magnifier = this.refs.magnifier
    var bigImageBox = this.refs.bigImageBox
    var bigImage = this.refs.bigImage
    var magnifyGlass = this.refs.magnifyGlass
    if (!wrap || !magnifier || !bigImageBox || !bigImage || !magnifyGlass) return;
    var _this = this
    // 绑定放大镜事件
    magnifier.onmouseover = function(e) {
       // 页面滚动条卷去的
      var scrollX = document.documentElement.scrollLeft
      var scrollY = document.documentElement.scrollTop
       // magnifier 加了 position 获取不到，只能取这个
      var startX = wrap.offsetLeft
      var startY = wrap.offsetTop
      // 鼠标悬浮后这时才加载大图片
      bigImage.setAttribute('src', `${HOST}/image/goods/smaill/${_this.state.selectImg}`)
      bigImageBox.style.display = 'block'
      magnifyGlass.style.display = 'block'

      magnifier.onmousemove = function(e) {
        var x = e.clientX + scrollX, y = e.clientY + scrollY, cx = x - startX, cy = y - startY
        bigImage.style.left = '-' + parseInt((x - startX) / 420 * 100) + '%'
        bigImage.style.top = '-' + parseInt((y - startY) / 430 * 100) + '%'
        magnifyGlass.style.left = cx < 100 ? '0px' : cx > 320 ? '220px' : cx - 100 + 'px'
        magnifyGlass.style.top = cy < 100 ? '0px' : cy > 320 ? '230px' : cy - 100 + 'px'

      }

      magnifier.onmouseleave = function() {
        bigImageBox.style.display = 'none'
        magnifyGlass.style.display = 'none'
        magnifier.onmousemove = null
        magnifier.onmouseleave = null
      }
    }

  }


  componentWillUnmount() {
    this.refs.magnifier.onmouseover = null
  }

  componentWillReceiveProps (nextProps) {
    if (initShopCar) {
      initShopCar = false
      return
    }
    let nowcount = this.props.shopCar.reduce((prev, next) => prev + next.products.length, 0)
    var nextcount = nextProps.shopCar.reduce((prev, next) => prev + next.products.length, 0)
    if (nowcount < nextcount) {
      // 添加商品到购物车成功
      this.props.alertMessageAction('添加成功，在购物车等 亲 >_<')
    }
  }

  // 点击选择属性
  specValueClick(value) {
    var _this = this
    return function () {
      // 更新选择的属性
      if (_this.state.specChoice[value.specNameIndex-1] === value.indexx) return;
      var specChoice = [..._this.state.specChoice]
      specChoice[value.specNameIndex-1] = value.indexx

      // 更新选择的商品详情和价格
      var specConfig = _this.state.specConfig
      var choiceProductDetail = _this.state.choiceProductDetail
      for (var i = 0, len = specConfig.length; i < len; i++) {
        var isOK = true
        for (var j = 0, len2 = specConfig[i].length; j < len2; j++) {
          if (specChoice[j] !== specConfig[i][j]) {
            isOK = false
            break;
          }
        }
        if (isOK) {
          choiceProductDetail = _this.props.goodDetail.find(item => item.indexx === i+1)
          break;
        }
      }
      _this.setState({
        specChoice,
        choiceProductDetail
      })
    }
  }

  // 点击选择数量
  choiceNumberChange(e) {
    var number = e.target.value
    var before = this.state.choiceNumber
    var _this = this
    this.setState({
      choiceNumber: number
    }, function () {
      if (!/^[1-9]\d{0,}$/.test(number)) {
        setTimeout(function () {
          _this.setState({
            choiceNumber: /^[1-9]\d{0,}$/.test(before) ? before : 1
          })
        }, 200)
      }
    })
  }
  // 数量减一
  minusNumber() {
    this.choiceNumberChange({ target: {value: Number(this.state.choiceNumber) - 1} })
  }
  // 数量加一
  plusNumber() {
    this.choiceNumberChange({ target: {value: Number(this.state.choiceNumber) + 1} })
  }
  // 鼠标移到小图片上
  onSmaillMouseOver(link) {
    var _this = this
    return function () {
      _this.setState({
        selectImg: link
      })
    }
  }
  // 关闭必须选择框
  closeMustChoice() {
    this.setState({
      showMustChoice: false
    })
  }
  buyNow() {
    // 如果商品未选择，或选择数量大于库存量
    if (this.state.choiceProductDetail.amount === undefined || this.state.choiceProductDetail.amount < this.state.choiceNumber) {
      return this.setState({
        showMustChoice: true
      })
    }
    // var buyProduct = [{
    //   goodId: this.props.goodId,
    //   productName: this.props.goodInfo.goodName,
    //   specName: this.props.specName,
    //   specValue: this.props.specValue,
    //   specChoice: this.state.specChoice,
    //   productDetail: this.state.choiceProductDetail,
    //   number: this.state.choiceNumber,
    //   storeName: this.props.storeInfo.storeName,
    //   nickname: this.props.storeInfo.nickname
    // }]
    // specName: this.props.specName,
    // specValue: this.props.specValue,
    // specChoice: this.state.specChoice,
    var buyProduct = [{
      goodId: this.props.goodId,
      goodName: this.props.goodInfo.goodName,
      storeName: this.props.storeInfo.storeName,
      storeId: this.props.storeInfo.storeId,
      nickname: this.props.storeInfo.nickname,
      number: this.state.choiceNumber,
      goodDetailId: this.state.choiceProductDetail._id,
      amount: this.state.choiceProductDetail.amount,
      price: this.state.choiceProductDetail.price,
      spec: this.state.specChoice.map((v, n) => ({
        specName: this.props.specName[n].specName,
        specValue: this.props.specValue.find(val => val.indexx === v).specValue
      }))
    }]
    this.props.setBuyProductsAction(buyProduct)
    this.props.history.push('/order')
  }

  // 添加到购物车
  addShopCar() {
    // 如果商品未选择，或选择数量大于库存量
    if (this.state.choiceProductDetail.amount === undefined || this.state.choiceProductDetail.amount < this.state.choiceNumber) {
      return this.setState({
        showMustChoice: true
      })
    }
    // 未登录跳转到登录页
    if (!this.props.isLogin) {
      let prev = transURL(this.props.location.pathname + this.props.location.search)
      return this.props.history.push(`/login?prev=${prev}`)
    }

    if (socket.status !== 'open') {
      return this.setState({
        errors: {
          ...this.state.errors,
          addShopCar: '网络未连接'
        }
      })
    }

    // webSocket 发送添加购物车请求
    socket.ws.send(JSON.stringify({
      type: 'add_shopcar_product',
      target: 'koa',
      content: {
        goodDetailId: this.state.choiceProductDetail._id,
        number: this.state.choiceNumber
      }
    }))
  }

  render() {
    const goodInfo = this.props.goodInfo
    const smaillPicture = this.props.smaillPicture
    return (
      <div className="spec-wrap">
        {/*图片组*/}
        <div className="spec-smail-picture-wrap">
          <div ref="magnifier" className="spec-smail-bigone-wrap">
            <img className="spec-smail-bigone" height="430px" src={`${HOST}/image/goods/smaill/${this.state.selectImg}_430x430q90.jpg`}/>
            <div ref="magnifyGlass" style={{
              position: 'absolute',
              top: '0',
              left: '0',
              zIndex: '100',
              width: '200px',
              height: '200px',
              display: 'none',
              background: `url(${HOST}/image/ui/magnify_glass.png)`
            }}></div>
          </div>
          <div className="spec-smaill-item-wrap">
            {
              this.props.smaillPicture.map((item, index) => (
                <div key={index} className="spec-priture-item">
                  <div className={this.state.selectImg === item.link ? "spec-img-selected" : "spec-item-img-box"}
                      onMouseOver={this.onSmaillMouseOver(item.link)}
                  >
                    <img src={`${HOST}/image/goods/smaill/${item.link}_60x60q90.jpg`} alt=""/>
                  </div>
                </div>
              ))
            }
          </div>
          <div ref="bigImageBox" style={{display: 'none'}} className="sepc-bigglass"><img ref="bigImage" className="spec-bigimage"/></div>
        </div>
        {/*spec属性信息*/}
        <div className="spec-goodinfo">
          <h3 className="spec-good-name">{goodInfo.goodName}</h3>
          <div className="spec-good-price" style={{background: `url(${HOST}/image/ui/price_background.png) left top`}}>
            <span className="sgp-f1">价格</span>
            <span className="sgp-f2">￥</span>
            <span className="sgp-f3">{transPrice(this.state.choiceProductDetail.price || this.state.nowPrice)}</span>
          </div>
          <div className="sell-count">
            <div className="sell-count-l"><span className="sc-f1">总销量</span><span className="sc-f2">{goodInfo.number}</span></div>
            <div className="sell-count-r"><span className="sc-f1">累计评价</span><span className="sc-f2">{this.props.comments.length}</span></div>
          </div>
          <div className={classnames({"show-choice": this.state.showMustChoice})}>
            <div style={{display: this.state.showMustChoice ? 'block':'none'}} className="show-choice-title">
              <div className="sct-l">请选择您要的商品信息</div>
              <div onClick={this.closeMustChoice.bind(this)} className="sct-r">X</div>
            </div>
            {
              this.props.specName && this.props.specName.map((name, index) => (
                <div className="specName-wrap" key={index}>
                  <div className="spec-name">{name.specName}</div>
                  <div className="spec-value">
                  {
                    this.props.specValue && this.props.specValue.map((value, index) => {
                      return value.specNameIndex === name.indexx ?  (
                        <div
                          className={classnames('spec-value-item', {'value-item-selected':this.state.specChoice[name.indexx-1] === value.indexx})}
                          onClick={this.specValueClick(value)}
                          key={index}
                        >
                          <span>{value.specValue}</span>
                          <i className="item-selected-i" style={{
                            background: `url(${HOST}/image/ui/background_selected.png) 0px 0px no-repeat`
                          }}></i>
                        </div>
                      ) : null
                    })
                  }
                  </div>
                </div>
              ))
            }
            <div className="g-num-wrap">
              <div className="good-number-name">数量</div>
              <div className="good-number-wrap">
                <div className="spec-num-input-wrap">
                  <input className="spec-number-input" value={this.state.choiceNumber} onChange={this.choiceNumberChange.bind(this)} type="text"/>

                </div>
                <div className="good-number-plus-minus">
                  <div onClick={this.plusNumber.bind(this)} className="spec-number-plus" style={{background: `url(${HOST}/image/ui/plus.png) no-repeat`, backgroundSize: '11px 11px', marginBottom: '4px', border: '1px solid #a7a6ab'}}></div>
                  <div onClick={this.minusNumber.bind(this)} className="spec-number-minus" style={{background: `url(${HOST}/image/ui/minus.png) no-repeat`, backgroundSize: '11px 11px', border: '1px solid #a7a6ab'}}></div>
                </div>
              </div>
              <div className="good-num-unit">件</div>
              <div className="good-num-kucun">库存{this.state.choiceProductDetail.amount === undefined ? this.state.allAmount : this.state.choiceProductDetail.amount}件</div>
            </div>
            <div
              style={{
                display: this.state.choiceProductDetail.amount !== undefined ? (this.state.choiceNumber > this.state.choiceProductDetail.amount ? 'block' : 'none') : (this.state.choiceNumber > this.state.allAmount ? 'block' : 'none'),
                marginTop: '10px',
                marginLeft: '70px',
              }}
            >
              <span className="good-num-over">
                <span style={{
                  display: 'inline-block',
                  background: `url(${HOST}/image/ui/msg.png) -61px -1px no-repeat`,
                  width: '23px',
                  height: '22px',
                  marginBottom: '-5px'
                }}></span>
                <span>您所填写数量商品超过库存！</span>
              </span>
            </div>
          </div>
          <div className="good-buy-wrap">
            <button onClick={this.buyNow.bind(this)}
              className={classnames("good-buy-now", {
                'buy-now-noPost': this.state.choiceProductDetail.amount !== undefined ? (this.state.choiceNumber > this.state.choiceProductDetail.amount || this.state.choiceProductDetail.amount === 0) : (this.state.choiceNumber > this.state.allAmount)
              })} to="/">立即购买</button>
            <button onClick={this.addShopCar.bind(this)} className={classnames("add-shopcat", {
                'add-shopcat-noPost': this.state.choiceProductDetail.amount !== undefined ? (this.state.choiceNumber > this.state.choiceProductDetail.amount || this.state.choiceProductDetail.amount === 0) : (this.state.choiceNumber > this.state.allAmount)
              })}>加入购物车</button>
          </div>
        </div>
      </div>
    )
  }
}

Spec.propTypes = {
  goodId: PropTypes.string.isRequired,
  goodDetail: PropTypes.array.isRequired,
  goodInfo: PropTypes.object.isRequired,
  smaillPicture: PropTypes.array.isRequired,
  specConfig: PropTypes.array,
  specName: PropTypes.array,
  specValue: PropTypes.array,
  comments: PropTypes.array.isRequired,
  setBuyProductsAction: PropTypes.func.isRequired,
  storeInfo: PropTypes.object.isRequired,
  isLogin: PropTypes.bool.isRequired,
  shopCar: PropTypes.array.isRequired,
}
function mapStateToProps(state) {
  return {
    isLogin: state.auth.isLogin,
    shopCar: state.auth.shopCar,
    goodDetail: state.product.productDetail.goodDetail,
    goodInfo: state.product.productDetail.goodInfo,
    smaillPicture: state.product.productDetail.smaillPicture,
    specConfig: state.product.productDetail.specConfig,
    specName: state.product.productDetail.specName,
    specValue: state.product.productDetail.specValue,
    comments: state.product.productDetail.comments,
    goodId: state.product.productDetail.goodId,
  }
}
export default withRouter(connect(mapStateToProps, { setBuyProductsAction, alertMessageAction })(Spec))
