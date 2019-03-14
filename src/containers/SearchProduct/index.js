import React, { Component } from 'react'
import axios from 'axios'
import queryString from 'query-string'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import config from '../../utils/config'

import './index.scss'
import Header from '../../components/Header'
import Search from '../../components/Search'
import Goods from '../../components/Goods'
import SubStore from './subpage/SubStore'

import { setSearchGoodsAction, setSearchKeyAction } from '../../flux/actions/productActions'

class SearchProduct extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchKey: props.match.params.q, // 游戏本
      searchUrl: props.history.location.search, // /?limit1=0&limit2=50
    }
    // 刷新后 store.searchKey 为空
    if (props.searchKey === '') {
      props.setSearchKeyAction(this.state.searchKey)
    }
    this.getGoods = this.getGoods.bind(this)
    this.getSearchProductUrl = this.getSearchProductUrl.bind(this)
  }

  componentWillMount() {
    this.getSearchProductUrl()
  }

  getGoods(goods) {
    this.props.setSearchGoodsAction(goods)
  }

  getSearchProductUrl() {
    var search = queryString.parse(this.props.location.search);
    var url = '/api/goods/search_product?'
    var isvalid = false
    if (search.q) {
      url += `q=${search.q}&`
      isvalid = true
    }
    if (/^\d+$/.test(search.detailId)) {
      url += `detailId=${search.detailId}&`
      isvalid = true
    }else if (/^\d+$/.test(search.smaillId)) {
      url += `smaillId=${search.smaillId}&`
      isvalid = true
    }else if (/^\d+$/.test(search.bigId)) {
      url += `bigId=${search.bigId}&`
      isvalid = true
    }
    if (search.storeId) {
      url += `storeId=${search.storeId}&`
    }
    if (!isvalid) {
      return '';
    }
    if (search.order === 'price' || search.order === 'number') {
      url += `order=${search.order}&sort=`
      url += search.sort === 'asc' ? 'asc&' : 'desc&'
    }
    url += (/^\d+$/.test(search.limit1) ? `limit1=${search.limit1}&` : '')
    url += (/^\d+$/.test(search.limit2) ? `limit2=${search.limit2}` : 'limit2=10')
    return url;
  }

  render() {
    const goods = this.props.searchGoods
    return (
      <div>
        <Header />
        <Search historyPush={this.props.history.push}  />
        <div className="search-product">
          <hr className="search-hr" />
          <SubStore />
          <Goods getGoods={this.getGoods} searchUrl={this.getSearchProductUrl()} />
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    searchGoods: state.product.searchGoods,
    searchKey: state.product.searchKey
  }
}

export default connect(mapStateToProps, { setSearchGoodsAction,setSearchKeyAction })(SearchProduct)

