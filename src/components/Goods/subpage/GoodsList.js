import React from 'react'
import classnames from 'classnames'
import config from '../../../utils/config'
import { Link } from 'react-router-dom'

function splitName(name) {
  if (name.length <= 50) return name;
  return name.substring(0,50) + '...'
}

const GoodsList = (props) => {
  const HOST = config.HOST
  return (
    <div className="goodlist-wrap">
      {
        props.goods.map((product, index) => {
          return (
            <div className={classnames("good-wrap", {
              rowlast: index>0 && index % 4 === 0
            })} key={index}>
              <Link to={`/product_detail?goodId=${product._id}`}>
                <div className="goodlogo-box"><img src={`${HOST}/image/goods/logo/${product.logo}`} alt=""/></div>
              </Link>
              <div className="good-price"><span className="p_f1">￥</span><span className="p_f2">{product.nowPrice}</span></div>
              <Link to={`/product_detail?goodId=${product._id}`}>
                <div className="good-name"><span>{splitName(product.goodName)}</span></div>
              </Link>
              <div className="good-store"><span className="s_f1">店铺：</span><span className="s_f2">{product.storeName}</span></div>
              <div className="good-number-box">
                <div className="good-number">
                  <span className="n_f1">成交量：</span><span className="n_f2">{product.number}笔</span>
                </div>
                <div className="good-number-chat">
                  聊
                </div>
              </div>
            </div>
          )
        })
      }
    </div>
  )
}
export default GoodsList
