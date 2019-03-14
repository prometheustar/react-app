import React from 'react'
import axios from 'axios'
import config from '../../../utils/config'
import socket from '../../../utils/socket'
import { contactItemToChatAction } from '../../../flux/actions/chatActions'

const HOST = config.HOST

class Search extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      searchAns: [],
      keyword: '',
      message: ''
    }
    this.shakeGetAns = this.shakeGetAns().bind(this)
  }

  // 防抖获取结果
  shakeGetAns() {
    var timer = 0
    var timeout = -1;
    return function(keyword) {
      var _this = this
      clearTimeout(timeout) // 清除前一个定时器
      timeout = setTimeout(function() {
        _this.setState({
          message: '搜索中...'
        })
        axios.get(`${HOST}/api/users/search_contacts?keyword=${_this.state.keyword}`)
          .then(res => {
            if (res.data.success) {
              _this.setState({
                searchAns: res.data.payload,
                message: res.data.payload.length === 0 ? '未搜索到联系人...' : ''
              })
            }
          })
          .catch(err => {
            console.error(err)
          })
      }, 1000)
    }
  }

  keywordChange(e) {
    var _this = this
    var keyword = e.target.value
    this.setState({
      keyword
    }, function() {
      _this.shakeGetAns(keyword)
    })
  }

  contactsClick(item) {
    contactItemToChatAction(item)
  }

  addContactsClick(item) {
    return function(e) {
      e.stopPropagation()
      if (socket.status === 'open') {
        socket.ws.send(JSON.stringify({
          type: 'add_contacts',
          content: item.userId
        }))
        this.setState({
          searchAns: this.state.searchAns.filter(i => i.userId !== item.userId)
        })
      }
    }
  }

  render() {
    return (
      <div className="chat-search-wrap">
        <div className="chat-s-input">
          <div className="chat-s-i-l"><input value={this.state.keyword} placeholder="输入联系人昵称" onChange={this.keywordChange.bind(this)} type="text"/></div>
          <div className="chat-s-i-r">点击搜索</div>
        </div>
        <div className="chat-s-ans">
          {
            Array.isArray(this.state.searchAns) && this.state.searchAns.length === 0 ? <div className="con-search-miss">{this.state.message}</div> : this.state.searchAns.map((item, index) => (
              <div onClick={this.contactsClick.bind(this, item)} className="c-s-item" key={index}>
                <div className="c-s-i-avatar"><img src={`${HOST}/image/member/avatar/${item.avatar}`} /></div>
                <div className="c-s-i-nickname">{item.nickname}</div>
                <div onClick={this.addContactsClick(item).bind(this)} className="c-s-i-btn-add">加好友</div>
              </div>
            ))
          }
        </div>
      </div>
    )
  }
}

export default Search
