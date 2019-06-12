import React from 'react'
import axios from 'axios'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import classnames from 'classnames'
import config from '../../../utils/config'

const HOST = config.HOST

function subStoreName(name) {
  if (typeof name !== 'string' || name.length < 6) return name;
  return name.substring(0,5) + '...';
}
class SubStore extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      stores: [],
      detailTypes: []
    }
  }

  // props.goods 参数更新, 根据 goods 请求 store 的信息
  componentWillReceiveProps(nextProps) {
    const goods = nextProps.goods
    if (!Array.isArray(goods) || goods.length < 1) return;
    // 根据detailType 请求 smaillType
    axios.get(`${HOST}/api/goods/type?type=detail&detailId=${goods[0].detailId}`)
      .then(res => {
        if (res.data.success) {
          this.setState({
            detailTypes: res.data.payload
          })
        }
      })
      .catch(err => {
        if (typeof(window) === 'object')
          console.error(err)
      })
    // 获取 goods 中的 storeId
    let storeIds = [];
    storeIds.push(goods[0].storeId)
    for (var i = 1, len = goods.length; i < len; i ++) {
      var storeId = goods[i].storeId
      var repeat = false
        // 去重
      for (var j = 0, len2 = storeIds.length; j < len2; j++) {
        if (storeId === storeIds[j]) {
          repeat = true
          break
        }
      }
      if (!repeat) storeIds.push(storeId)
    }
    // 请求 stores
    if (storeIds.length < 1) return;
    const jsonStoreIds = JSON.stringify(storeIds)
    axios.get(`${HOST}/api/goods/search_store?storeIds=${jsonStoreIds}`)
      .then(res => {
        if (res.data.success) {
          this.setState({
            stores: res.data.payload
          })
        }
      })
      .catch(err => {
        if (typeof(window) === 'object')
          console.error(err)
      })
  }

  render() {
    var detail = this.state.detailTypes.find((detail, index) => {
                    return detail.detailId === this.props.goods[0].detailId
                  })
    return (
      <div className="substore">
        {
          /*展示首页 > 小分类 > 详细分类s */
          this.state.detailTypes.length > 0 && (
            <div className="crum">
              <div className="crum-1"><Link to="/"><span>首页</span></Link></div>
              <div className="crum-2">
                <Link to={`/search_product?smaillId=${this.state.detailTypes[0].smaillId}`}>
                  <span>{this.state.detailTypes[0].smaillName}</span>
                </Link>
              </div>
              <div  className="crum-3">
                <Link to={`/search_product?detailId=${this.props.goods[0].detailId}`}>
                  <span>
                  {
                    detail ? detail.detailName : this.state.detailTypes[0].detailName
                  }
                  </span>
                </Link>
                <ul className="crum-details">
                {
                  this.state.detailTypes.map((detailType, index) => (
                    <li className="" key={index}>
                      <Link
                        className={classnames({'crum-selected': detailType.detailId === this.props.goods[0].detailId})}
                        to={`/search_product?detailId=${detailType.detailId}`}
                      >{detailType.detailName}</Link>
                    </li>
                  ))
                }
                </ul>
              </div>
            </div>
          )
        }
        {
          this.state.stores.length > 0 && <div className="substore-logo-box">
            <div className="s-logo-title">推荐店铺</div>
            <div className="s-logo-wrap">
            {
              /*展示店铺图片*/
              this.state.stores.map((store, index) => {
                if (index > 7) return null
                return (
                  <div className="s-logo-item" key={index}>
                    <div className="s-store-logo"><img src={`${HOST}/image/store/logo/${store.logo}`} alt=""/></div>
                    <div className="s-store-name"><Link to={`/search_product?storeId=${store._id}`}><span>{subStoreName(store.storeName)}</span></Link></div>
                  </div>
                )
              })
            }
            </div>
          </div>
        }
      </div>
    )
  }
}
SubStore.propTypes = {
  goods: PropTypes.array.isRequired
}

export default SubStore
