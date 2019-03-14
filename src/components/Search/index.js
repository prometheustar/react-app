import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import config from '../../utils/config'

import './search.scss'

import { setSearchKeyAction } from '../../flux/actions/productActions'

var beforeKey = ''
var searchKey = ''
var historyPush;

function searchInputChange(e) {
  searchKey = e.target.value
}

function searchProduct() {
  if (searchKey === beforeKey) return;
  // url 第一个参数没有改变页面不会重新渲染
  // historyPush('/404')
  // setTimeout(function() {
    historyPush(`/search_product?q=${searchKey}&limit1=0&limit2=50`)
  // }, 100)
}

const Search = (props) => {
  searchKey = beforeKey = props.searchKey || ''
  historyPush = props.historyPush || function(){}
  return (
    <div className="sear">
      <div className="sear-logo"><Link to="/"><img src={`${config.HOST}/image/ui/search_home_logo.png`} alt=""/></Link></div>
      <div className="sear-input-wrap">
        <div>
          <div>
            <input defaultValue={searchKey} onChange={searchInputChange}  className="sear-input" type="text"/>
          </div>
          <div>
            <button onClick={searchProduct} className="com-search-btn">搜索</button>
          </div>
        </div>
      </div>
    </div>
  )
}

Search.propType = {
  searchKey: PropTypes.string,
  historyPush: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  return {
    searchKey: state.product.searchKey
  }
}

export default connect(mapStateToProps, {setSearchKeyAction})(Search)
