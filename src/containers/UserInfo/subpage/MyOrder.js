/**
 * 我的订单
 */
import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import axios from 'axios'
import classnames from 'classnames'
import config from '../../../utils/config'
import socket from '../../../utils/socket'
import { setPayOrderAction, prevPageOrdersAction } from '../../../flux/actions/orderActions'
import { alertMessageAction, confirmMessageAction } from '../../../flux/actions/messageAction'

import OrderItem from '../../../components/OrderItem'
import CommentBox from '../../../components/CommentBox'


const HOST = config.HOST

function isNullArray(productArray) {
  for (var i = 0, len = productArray.length; i < len; i++) {
    if (productArray[i])
      return false
  }
  return true
}

class Order extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      nav: 0,  // 0 all, 1 waitPay, 2 waitSend, 3 waitSign, 4 waitComment
      errors: {},
      limit: 0,
      showCommentBox: false,
      commentOrderDetailId: -1
    }
    this.closeCommentBox = this.closeCommentBox.bind(this)
  }
  componentWillMount() {
    if (socket.status === 'open') {
      socket.ws.send(JSON.stringify({
        type: 'get_orders',
        content: { limit: this.state.limit }
      }))
    }else if (typeof(window) === 'object') {
      setTimeout(() => {
        if (socket.status === 'open') {
          socket.ws.send(JSON.stringify({
            type: 'get_orders',
            content: { limit: this.state.limit }
          }))
        }
      }, 200)
    }
  }

  routeChangeHandler(route) {
    if (this.state.nav === route) return;
    this.setState({
      nav: route
    })
  }

  closeCommentBox() {
    this.setState({ showCommentBox: false })
  }

  // 付款，签收，评论
  orderItemOperatorHandler(nav, order, orderDetail) {
    if (nav === 'pay') {
      axios.post(`${HOST}/api/order/pay_order`, { orderno: order.orderno })
        .then(res => {
          if (!res.data.success) {
            return this.setState({
              errors: {...this.state.errors, pay: res.data.message}
            })
          }
          this.props.setPayOrderAction(res.data.payload)
          // 跳转到支付页面
          this.props.history.push('/payorder')
        })
        .catch(err => {
          this.setState({
            errors: {...this.state.errors, pay: err.message}
          })
        })

    }else if (nav === 'sign') {
      // return this.props.alertMessageAction('睡瞌睡看看书')
      if (socket.status !== 'open') {
        return this.setState({ errors: {...this.state.errors, sign: '网络未连接'} })
      }
      // 弹出确认框
      this.props.confirmMessageAction(`确认签收商品：${orderDetail.goodName}`, () => {
        socket.ws.send(JSON.stringify({
          type: 'sign_order',
          content: {
            orderno: order.orderno,
            detailId: [orderDetail.orderDetailId],
            limit: this.state.limit
          }
        }))
      })
    }else if (nav === 'signOrder') {
      // console.log(order.orderno)
      if (socket.status !== 'open') {
        return this.setState({ errors: {...this.state.errors, sign: '网络未连接'} })
      }
      // 弹出确认框
      this.props.confirmMessageAction(`确认签收订单：${order.orderno}`, () => {
        socket.ws.send(JSON.stringify({
          type: 'sign_order',
          content: {
            orderno: order.orderno,
            detailId: order.products.map((item) => item.orderDetailId),
            limit: this.state.limit
          }
        }))
      })
    }else if (nav === 'comment') {
      this.setState({
        showCommentBox: true,
        commentOrderDetailId: orderDetail.orderDetailId
      })
    }
  }

  nextPage() {
    if(this.props.myOrders.end) return;
    if (socket.status === 'open') {
      this.setState({
        limit: this.state.limit + 1
      }, () => {
        socket.ws.send(JSON.stringify({
          type: 'get_orders',
          content: { limit: this.state.limit * 20 }
        }))
      })
    }
  }

  prevPage() {
    if(this.state.limit <= 0) return;
    if (socket.status === 'open') {
      this.setState({
        limit: this.state.limit - 1
      }, () => {
        this.props.prevPageOrdersAction()
        socket.ws.send(JSON.stringify({
          type: 'get_orders',
          content: { limit: this.state.limit * 20 }
        }))
      })
    }
  }

  render() {
    let orders = this.props.myOrders.orders.map((item, index) => {
        if (this.state.nav === 0) {
          return item
        }else if (this.state.nav === 1) {
          return item.isPay === 0 ? item : null
        }else if (item.isPay === 1) {
          var products = item.products.map((prod) => {
            return this.state.nav === 2 && prod.isSend === 0 ? prod :
              this.state.nav === 3 && prod.isSend === 1 && prod.isSign === 0 ? prod :
              this.state.nav === 4 && prod.isSend === 1 && prod.isSign === 1 && prod.isComment === 0 ? prod : null
          })
          return isNullArray(products) ? null : {...item, products}
        }
        return null
      })
    let {waitPay, waitSend, waitSign, waitComment} = this.props.myOrders.status
    return (
      <div>
        <div className="u-order-wrap">
          <div onClick={this.routeChangeHandler.bind(this, 0)} className={classnames("u-o-item", {
            'uoi-hit': this.state.nav === 0
          })}><span className="uoi-nav">全部订单</span></div>
          <div onClick={this.routeChangeHandler.bind(this, 1)} className={classnames("u-o-item", {
            'uoi-hit': this.state.nav === 1
          })}>
            <span className="uoi-nav">待付款</span>
            { waitPay > 0 && <span className="uoi-hit uoi-count">{waitPay}</span> }
          </div>
          <div onClick={this.routeChangeHandler.bind(this, 2)} className={classnames("u-o-item", {
            'uoi-hit': this.state.nav === 2
          })}>
            <span className="uoi-nav">待发货</span>
            { waitSend > 0 && <span className="uoi-hit uoi-count">{waitSend}</span> }
          </div>
          <div onClick={this.routeChangeHandler.bind(this, 3)} className={classnames("u-o-item", {
            'uoi-hit': this.state.nav === 3
          })}>
            <span className="uoi-nav">待收货</span>
            { waitSign > 0 && <span className="uoi-hit uoi-count">{waitSign}</span> }
          </div>
          <div onClick={this.routeChangeHandler.bind(this, 4)} className={classnames("u-o-item u-o-item-last", {
            'uoi-hit': this.state.nav === 4
          })}>
            <span className="uoi-nav">待评价</span>
            { waitComment > 0 && <span className="uoi-hit uoi-count">{waitComment}</span> }
          </div>
        </div>
        <div className="u-o-page">
          <div onClick={this.nextPage.bind(this)} className={classnames("u-o-next", {
            'u-o-next-void': this.props.myOrders.end
          })}>下一页</div>
          <div onClick={this.prevPage.bind(this)} className={classnames("u-o-prev", {
            'u-o-prev-void': this.state.limit === 0
          })}>上一页</div>
        </div>
        <div className="uo-i-wrap">
          {
            orders.map((item, index) => {
              return <OrderItem key={index}
                        handler={this.orderItemOperatorHandler.bind(this)}
                        nav={this.state.nav}
                        userId={this.props.userId}
                        order={item} />
            })
          }
        </div>
        {
          this.state.showCommentBox && this.state.commentOrderDetailId !== -1 && <CommentBox orderDetailId={this.state.commentOrderDetailId} closeCommentBox={this.closeCommentBox} limit={this.state.limit} />
        }
      </div>
    )
  }
}

Order.propTypes = {
  myOrders: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  myOrders: state.order.myOrders || {status: {}, orders:[]},
  userId: state.auth.user.userId
})

export default connect(mapStateToProps, {
  setPayOrderAction,
  alertMessageAction,
  confirmMessageAction,
  prevPageOrdersAction
})(Order)
