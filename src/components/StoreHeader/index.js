import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter, Link } from 'react-router-dom'

import './index.scss'
import { contactItemToChatAction } from '../../flux/actions/chatActions'
import { alertMessageAction, confirmMessageAction } from '../../flux/actions/messageAction'
import { transSearchKeyword, transURL } from '../../utils/tools'
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
    if (this.state.searchKey === '')
      return this.props.alertMessageAction('请输入要搜索的内容')
    this.props.history.push(`/search_products?limit1=0&limit2=20&q=${transSearchKeyword(this.state.searchKey)}`)
  }
  // 搜本店
  searchStoreProduct() {
    if (this.state.searchKey === '')
      return this.props.alertMessageAction('请输入要搜索的内容')
    console.log(`/search_products?limit1=0&limit2=20&q=${transSearchKeyword(this.state.searchKey)}&storeId=${this.props.storeInfo.storeId}`)
    this.props.history.push(`/search_products?limit1=0&limit2=20&storeId=${this.props.storeInfo.storeId}&q=${transSearchKeyword(this.state.searchKey)}`)
  }

  connectBoos() {
    if (!this.props.isLogin) {
      var _this = this
      return _this.props.confirmMessageAction('登录后与卖家聊天，现在登录吗？', function() {
        _this.props.history.push('/login?prev=' + transURL(_this.props.location.pathname + _this.props.location.search))
      })
    }
    contactItemToChatAction({
      userId: this.props.storeInfo.userId,
      avatar: this.props.storeInfo.avatar,
      nickname: this.props.storeInfo.nickname,
    })
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
            <div className="store-boos">
              <span>掌柜：{storeInfo.nickname}</span>
              {
                this.props.userId === storeInfo.userId ? null : <p onClick={this.connectBoos.bind(this)} title="点此和掌柜联系" className="store-connect"></p>
              }
            </div>
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
  storeInfo: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
  return {
    userId: state.auth.user.userId,
    isLogin: state.auth.isLogin,
  }
}

export default withRouter(connect(mapStateToProps, { alertMessageAction, confirmMessageAction })(StoreHeader))
