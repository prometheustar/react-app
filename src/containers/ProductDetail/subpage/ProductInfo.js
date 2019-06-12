import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import LazyLoad from 'react-lazyload'
import config from '../../../utils/config'
import { formatDate } from '../../../utils/tools'
const HOST = config.HOST

class ProductInfo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showDetail: true,
      showMagnify: false,
      magnifyCommPicture: ''
    }
  }

  showDetial(showDetail) {
    return function() {
      this.setState({
        showDetail
      })
    }
  }

  commentPictureClick(e) {
    var bigsrc = e.target.getAttribute('bigsrc')
    if (bigsrc) {
      if (this.state.magnifyCommPicture === bigsrc) {
        return this.setState({ showMagnify: false, magnifyCommPicture: '' })
      }
      this.setState({
        showMagnify: true,
        magnifyCommPicture: bigsrc
      })
    }
  }

  hideMagnify() {
    this.setState({ showMagnify: false, magnifyCommPicture: '' })
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
            })} onClick={this.showDetial(false).bind(this)}>累计评价<span className="spec-comment-count">{this.props.comments.length}</span></div>
          </div>
          {
            /*商品详情图*/
            this.state.showDetail && this.props.infoPicture.map((item, index) => (
              <div key={index} className="info-picture-item">
                <LazyLoad height={700} once>
                  <img src={`${HOST}/image/goods/info/${item.link}`}/>
                </LazyLoad>
              </div>
            ))
          }
          {
            /*评论*/
            this.props.comments.map((item, index) => (
              <div className="f_wrap comm-item" key={index}>
                <div className="f_l">
                  <div className="comm-i-content">{item.content}</div>
                  <div className="f_wrap comm-i-pics" onClick={this.commentPictureClick.bind(this)}>
                    {
                      item.pictures.map((pic, index) => (
                        <div className="f_l comm-i-pic-i" key={index}>
                          <img src={`${HOST}/image/goods/comment/${pic}_w40.jpg`} bigsrc={pic}/>
                        </div>
                      ))
                    }
                  </div>
                  <div className="comm-i-creaTime">{formatDate(item.creaTime)}</div>
                </div>
                <div className="f_r f_wrap">
                  <div className="f_r comm-i-nickname">{item.nickname}</div>
                  <div className="f_r comm-spec-wrap">
                    {
                      item.spec.map((item, index) => (
                        <div className="comm-spec" key={index}>
                          <span className="comm-spec-name">{item.name}：</span>
                          <span className="comm-spec-val">{item.value}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            ))
          }
          {
            <div className="comm-bigimg" onClick={this.hideMagnify.bind(this)} style={{ display: this.state.showMagnify ? 'block' : 'none' }}>
              <img src={`${HOST}/image/goods/comment/${this.state.magnifyCommPicture}`} />
            </div>
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
