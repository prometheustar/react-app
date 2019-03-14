import React from 'react'
import PropTypes from 'prop-types'
import { withRouter, Link } from 'react-router-dom'

import './index.scss'
import config from '../../utils/config'
const HOST = config.HOST

class StoreHeader extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      searchKey: ''
    }
    this.onSearchInputChange = this.onSearchInputChange.bind(this)
  }
  onSearchInputChange(e) {
    this.setState({
      searchKey: e.target.value
    })
  }
  // 搜所有
  searchAllProduct() {
    if (this.state.searchKey !== '')
      this.props.history.push(`/search_products?q=${this.state.searchKey}`)
  }
  // 搜本店
  searchStoreProduct() {
    if (this.state.searchKey !== '')
      this.props.history.push(`/search_products?q=${this.state.searchKey}&storeId=${this.props.storeInfo.storeId}`)
  }
  render() {
    const storeInfo = this.props.storeInfo
    return (
      <div className="store-header">
          <div className="store-cp-logo">
            <Link to="/">
              <img src={`${HOST}/image/ui/storetitle.png`} height="60px" />
            </Link>
          </div>
        <div className="store-info-wrap">
          <div className="store-info-logo">
              <img height="60px" src={`${HOST}/image/store/logo/${storeInfo.logo || 'default.jpg'}`} alt="优选"/>
          </div>

          <div className="store-info">
            <p className="store-name">店铺：{storeInfo.storeName}</p>
            <p className="store-boos">掌柜：{storeInfo.nickname}</p>
          </div>
        </div>
        <div className="store-search">
          <div className="store-search-input"><input value={this.state.searchKey} onChange={this.onSearchInputChange} type="text"/></div>
          <button style={{background: `url("${HOST}/image/ui/TB1ZWVhJpXXXXa4XVXXs1m4TXXX-458-36.png") top right no-repeat`}} className="store-search-btn-all" onClick={this.searchAllProduct.bind(this)}>搜索</button>
          <button className="store-search-btn-this" onClick={this.searchStoreProduct.bind(this)}>搜本店</button>
        </div>
      </div>
    )
  }
}

StoreHeader.propTypes = {
  storeInfo: PropTypes.object.isRequired
}

export default withRouter(StoreHeader)
