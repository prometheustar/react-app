import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import config from '../../../utils/config'
const HOST = config.HOST

/**
 * 未实现懒加载
 */
class ProductInfo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showDetail: true
    }
  }
  showDetial(showDetail) {
    return function() {
      this.setState({
        showDetail
      })
    }
  }
  render() {
    return (
      <div className="product-info-wrap">
        <div className="product-info-box">
          <div className="product-info-nav">
            <div className={classnames("pin-1", {
              'product-info-selected': this.state.showDetail
            })} onClick={this.showDetial(true).bind(this)}>商品详情</div>
            <div className={classnames("pin-2", {
              'product-info-selected': !this.state.showDetail
            })} onClick={this.showDetial(false).bind(this)}>累计评价</div>
          </div>
          {
            /*商品详情图*/
            this.state.showDetail && this.props.infoPicture.map((item, index) => (
              <div className="info-picture-item" key={index}><img src={`${HOST}/image/goods/info/${item.link}`}/></div>
            ))
          }
          {
            /*评论*/
            this.props.comments.map((item, index) => (
              <div key={index}>
                <div>{item.nickname}</div>
                <div>{item.content}</div>
                <div>{item.creaTime}</div>
              </div>
            ))
          }
        </div>
      </div>
    )
  }
}
ProductInfo.propTypes = {
  infoPicture: PropTypes.array.isRequired,
  comments: PropTypes.array.isRequired,
}

export default ProductInfo
