import React, { Component } from 'react'
import axios from 'axios'
import queryString from 'query-string'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import config from '../../utils/config'
import { transSearchKeyword } from '../../utils/tools'
import { alertMessageAction } from '../../flux/actions/messageAction'

import './index.scss'
import Header from '../../components/Header'
import SearchProductsList from '../../components/Goods/SearchProductsList'
import SubStore from './subpage/SubStore'
import Loading from '../../components/PrivateRoute/subpage/WaitVerify'
import Footer from '../../components/Footer'

import { setSearchGoodsAction, setSearchKeyAction } from '../../flux/actions/productActions'

// 获取浏览器视口的高度
function getWindowHeight(){
　　var windowHeight = 0;
　　if(document.compatMode == "CSS1Compat"){
　　　　windowHeight = document.documentElement.clientHeight;
　　}else{
　　　　windowHeight = document.body.clientHeight;
　　}
　　return windowHeight;
}

// 获取文档的总高度
function getDocumentHeight(){
　　var scrollHeight = 0, bodyScrollHeight = 0, documentScrollHeight = 0;
　　if(document.body){
　　　　bodyScrollHeight = document.body.scrollHeight;
　　}
　　if(document.documentElement){
　　　　documentScrollHeight = document.documentElement.scrollHeight;
　　}
　　scrollHeight = (bodyScrollHeight - documentScrollHeight > 0) ? bodyScrollHeight : documentScrollHeight;
　　return scrollHeight;
}
// 滚动条在 Y 轴上的滚动距离
function getScrollTop(){
　　var scrollTop = 0, bodyScrollTop = 0, documentScrollTop = 0;
　　if(document.body){
　　　　bodyScrollTop = document.body.scrollTop;
　　}
　　if(document.documentElement){
　　　　documentScrollTop = document.documentElement.scrollTop;
　　}
　　scrollTop = (bodyScrollTop - documentScrollTop > 0) ? bodyScrollTop : documentScrollTop;
　　return scrollTop;
}

const HOST = config.HOST

class SearchProduct extends Component {
  constructor(props) {
    super(props)
    this.state = {
      condition: '?', //  搜索关键字
      keyword: '',
      limit: 0, // 搜索页数
      end: false,  // 分页结束
      products: [], // 搜索结果
      loading: true,
      errors: {}
    }
  }

  componentWillMount() {
    var condition = this.props.location.search
    var search = queryString.parse(condition);

    // 第一次请求 20 条数据，后面每次请求 10 条
    condition = ''
    if (search.q) {
    // 1. 有关键字
      condition += `&q=${encodeURIComponent(search.q)}`
    }else if (/^[1-9]\d*$/.test(search.storeId)) {
    // 2. 有店铺 id
      condition += `&storeId=${search.storeId}`
    }else if (/^[1-9]\d*$/.test(search.detailId)) {
    // 3. 有详细分类 id
      condition += `&detailId=${search.detailId}`
    }else if (/^[1-9]\d*$/.test(search.smaillId)) {
    // 4. else 有小分类 id
      condition += `&smaillId=${search.smaillId}`
    }else if (/^[1-9]\d*$/.test(search.bigId)) {
    // 5. else 有大分类 id
      condition += `&bigId=${search.bigId}`
    }
    if (condition === '') {
      return this.setState({
        loading: false,
        condition: ''
      })
    }

    axios.get(`${HOST}/api/goods/search_product?limit1=0&limit2=20${condition}`)
      .then(res => {
        if (!res.data.success) {
          return this.setState({
            loading: false,
            errors: { ...this.state.errors, search: res.data.message }
          })
        }
        this.setState({
          loading: false,
          products: res.data.payload.products,
          end: res.data.payload.end,
          condition,
          keyword: search.q ? search.q.replace(/\+/g, ' ') : ''
        }, () => {
          this.props.history.push(`/search_products?limit1=0&limit2=10${condition}`)
        })
      })
      .catch(err => {
        this.setState({
          loading: false,
          errors: { ...this.state.errors, search: err.message }
        })
      })
  }

  componentDidMount() {
    var _this = this
    window.onscroll = function () {
      if (!_this.state.end && !_this.state.loading && getScrollTop() + getWindowHeight() >= getDocumentHeight() - 200) {
        // 先暂停后发送请求
        _this.setState({
          loading: true
        }, function() {
            var get = `limit1=${this.state.products.length}&limit2=10${this.state.condition}`
            axios.get(`${HOST}/api/goods/search_product?${get}`)
              .then(res => {
                if (!res.data.success) {
                  return _this.setState({
                    loading: false,
                    errors: { ..._this.state.errors, search: res.data.message }
                  })
                }
                _this.setState({
                  loading: false,
                  products: _this.state.products.concat(res.data.payload.products),
                  end: res.data.payload.end,
                  // limit: Number(_this.state.limit) + 1
                }, function () {
                  if (res.data.payload.end) {
                    window.onscroll = null
                  }
                  _this.props.history.push(`/search_products?${get}`)
                })
              })
              .catch(err => {
                _this.setState({
                    loading: false,
                  errors: { ..._this.state.errors, search: err.message }
                })
              })
        })
      }
    }
  }

  componentWillUnmount() {
    window.onscroll = null
  }

  keywordChangeHandler(e) {
    this.setState({
      keyword: e.target.value
    })
  }

  // 点击搜索关键字
  searchProductSubmit(e) {
    e.preventDefault()
    if (this.state.keyword.trim() === '') {
      return this.props.alertMessageAction('请输入要搜索的商品描述')
    }
    var condition = `&q=${transSearchKeyword(this.state.keyword)}`
    axios.get(`${HOST}/api/goods/search_product?limit1=0&limit2=20${condition}`)
      .then(res => {
        if (!res.data.success) {
          return this.setState({
            errors: { ...this.state.errors, search: res.data.message }
          })
        }
        this.setState({
          products: res.data.payload.products,
          end: res.data.payload.end,
          condition
        }, () => {
          this.props.history.push(`/search_products?limit1=0&limit2=20${condition}`)
        })
      })
      .catch(err => {
        this.setState({
          errors: { ...this.state.errors, search: err.message }
        })
      })
  }

  render() {
    if (!this.state.products) {
      return <div><Header /><h2>发生了未知的错误</h2></div>
    }
    // 将 goods 20个一组进行分组
    var group = this.state.products.reduce((prev, next) => {
      if (prev.goods[prev.count].length >= prev.limit) {
        prev.goods.push([next])
        prev.count++
      }else {
        prev.goods[prev.count].push(next)
      }
      return prev
    }, {count: 0, limit: 20, goods: [[]]})
    var products = group.goods[0].length === 0 ? [] : group.goods

    return (
      <div>
        <Header />
        <div className="sear">
          <div className="sear-logo"><Link to="/"><img src={`${HOST}/image/ui/search_home_logo.png`} alt=""/></Link></div>
          <div className="sear-input-wrap">
            <form onSubmit={this.searchProductSubmit.bind(this)}>
              <div>
                <input value={this.state.keyword} onChange={this.keywordChangeHandler.bind(this)} placeholder="在此输入商品描述" className="sear-input" type="text"/>
              </div>
              <div>
                <button type="submit" onClick={this.searchProductSubmit.bind(this)} className="com-search-btn">搜索</button>
              </div>
            </form>
          </div>
        </div>
        <div className="search-product">
          <hr className="search-hr" />
          {
            this.state.products.length > 0 && <SubStore goods={this.state.products} />
          }
         { products.map((item, index) => <SearchProductsList products={item} key={index}/>) }
         {
          this.state.loading && <Loading message="努力加载中。。。" />
         }
         {
          this.state.condition === '' && <h2 style={{height: '200px', lineHeight: '200px'}}>搜索条件为空！</h2>
         }
        </div>
        <Footer />
      </div>
    )
  }
}

export default connect(null, { alertMessageAction })(SearchProduct)

