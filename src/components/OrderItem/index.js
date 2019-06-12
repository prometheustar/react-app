import React from 'react'
import { formatDate } from '../../utils/tools'
import { Link } from 'react-router-dom'
import { contactItemToChatAction } from '../../flux/actions/chatActions'
import './index.scss'

function hasNullArray(products) {
  for (var i = 0, len = products.length; i < len; i++) {
    if (products[i] === null) {
      return true
    }
  }
  return false
}

function splitGoodName(name) {
  return typeof(name) !== 'string' ? '' : name.length < 35 ? name : name.substring(0,34) + '...'
}

// 点击联系商家
function contactSeller(userId, nickname, avatar) {
  return function () {
    contactItemToChatAction({ userId, nickname, avatar })
  }
}

const OrderItem = (props) => {
  var order = props.order
  return order === null ? <div></div> : (
    <div className="order-item">
      <div className="o-i-head">
        <div className="oih-i oi-date">{formatDate(order.creaTime, true)}</div>
        <div className="oih-i oi-no">订单号：{order.orderno}</div>
        <div className="oih-i oi-sumprice">￥{order.sumPrice}</div>
        <div className="oih-i oi-storename">{order.storeName}</div>
        {
          order.sellerId !== props.userId && <div onClick={contactSeller(order.sellerId, order.sellerName, order.sellerAvatar)} className="oih-i oi-callseller">
            <div className="oi-call-logo"></div>
            <div className="oi-contact">和我联系</div>
          </div>
        }
        {
          /*订单收货*/
          props.nav === 3 && !hasNullArray(order.products) ?
          <div className="oih-i oih-sign" onClick={() => { props.handler('signOrder', order) }}>签收订单</div> : null
        }
      </div>
      <div className="oi-product">
        {
          order.products.map((item, i) => {
            return item === null ? null : (
              <div className="oip-i-wrap" key={i}>
                <div className="oip-i oip-i-logo"><img width="80px" src={`${'http://118.126.108.36'}/image/goods/logo/${item.logo}_210x210q90.jpg`} alt={item.goodName}/></div>
                <div className="oip-i oip-i-info">
                  <div className="oip-i-goodname"><Link to={`/product_detail?goodId=${item.goodId}`}>{splitGoodName(item.goodName)}</Link></div>
                </div>
                <div className="oip-i oip-i-price">￥{item.price}</div>
                <div className="oip-i oip-i-number">{item.number}</div>
                <div className="oip-i oip-exp">
                  {
                    item.postWay && <div>
                      <div className="oip-exp-post">{item.postWay}</div>
                      <p title={item.expNumber} className="oip-exp-num">{item.expNumber}</p>
                    </div>
                  }
                </div>
                <div className="oip-i oip-i-operator">
                 {
                  order.isPay !== 1 ? null :
                  item.isComment === 1 && item.isSign === 1 && item.isSend === 1 ? (<div className="opre-i-wrap">
                    <span className="opre-i-finish">订单已完成</span>
                  </div>) : item.isComment === 0 && item.isSign === 1 && item.isSend === 1 ? (<div className="opre-i-wrap">
                    <button className="opre-i-comment" onClick={() => { props.handler('comment', order, item) }}>评价</button>
                  </div>) : item.isSign === 0 && item.isSend === 1 ? (<div className="opre-i-wrap">
                    <button className="opre-i-sign" onClick={() => { props.handler('sign', order, item) }}>确认收货</button>
                  </div>) : item.isSend === 0 ? (<div className="opre-i-wrap">
                    <span className="opre-i-waitsend">等待卖家发货</span>
                  </div>) : null
                 }
                </div>
              </div>
            )
          })
        }
        {
          order.isPay !== 0 ? null : <div className="order-i-pay">
            <button onClick={() => { props.handler('pay', order) }}>立即付款</button>
          </div>
        }
      </div>

    </div>
  )
}
export default OrderItem
