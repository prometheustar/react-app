import React from 'react'
import axios from 'axios'
import PropTypes from 'prop-types'
import config from '../../utils/config'

import './goods.scss'
import Wait from './subpage/Wait'
import ErrorPage from './subpage/ErrorPage'
import Empty from './subpage/Empty'
import GoodsList from './subpage/GoodsList'

const HOST = config.HOST

// props.goods 为undefined 或空数组，显示默认空结果页面
class Goods extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      goods: [],
      status: 'wait',
      error: ''
    }
  }
  componentWillMount() {
    const searchUrl = this.props.searchUrl
    if (!searchUrl) {
      // 参数错误
      return this.setState({
        status: 'empty'
      })
    }
    axios.get(HOST + searchUrl)
      .then(res => {
        console.log(res)
        if (res.data.success) {
          // 请求成功
          this.setState({
            status: 'end',
            goods: res.data.payload
          }, () => {
            // 给父组件回调 goods
            this.props.getGoods && this.props.getGoods(res.data.payload)
          })
        } else {
          // 请求失败
          this.setState({
            status: 'error',
            error: res.message
          })
        }
      })
      .catch(err => {
        // 请求错误
        console.error(err)
        this.setState({
          status: 'error',
          error: err.message
        })
      })
  }
  render() {
    return (
      <div>
        {
          this.state.status === 'wait' ? <Wait /> :
          this.state.status === 'error' ? <ErrorPage message={this.state.error} /> :
          this.state.goods.length === 0 ? <Empty /> :
          <GoodsList goods={this.state.goods} />
        }
      </div>
    )
  }
}
Goods.propTypes = {
  searchUrl: PropTypes.string.isRequired,
  getGoods: PropTypes.func
}

export default Goods
