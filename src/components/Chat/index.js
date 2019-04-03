/**
 * 在 App.js 中判断显示 store 中是否显示聊天功能，购物车点击青蛙显示
 * 请求消息记录，显示条数
 * 系统消息，用户消息
 */
import React from 'react'
import { connect } from 'react-redux'
import config from '../../utils/config'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import './index.scss'
import Message from './subpage/Message'
import Contacts from './subpage/Contacts'
import Search from './subpage/Search'
import ChatWindow from './subpage/ChatWindow'

import { initContacts } from '../../flux/actions/chatActions'


const HOST = config.HOST

class Chat extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      route: 'message',  // 显示 message，contacts，search
      message: '',
    }
  }

  componentDidMount() {
    if (typeof(window) === 'object') {
      var chat = document.getElementById('chat')
      var chatMove = document.getElementById('chat-move')

      chatMove.onmousedown = function(e) {
        var startX = e.clientX
        var startY = e.clientY
        var top = parseInt(window.getComputedStyle(chat)['top'])
        var left = parseInt(window.getComputedStyle(chat)['left'])
        // var X = document.documentElement.clientWidth  // 窗口高宽
        // var Y = document.documentElement.clientHeight
        document.onmousemove = function(e) {
          /**
           * 判断将窗口拖出文档
           */
          chat.style.left = left + (e.clientX - startX) + 'px'
          chat.style.top = top + (e.clientY - startY) + 'px'
        }

        document.onmouseup = function() {
          // chat.onmousedown = null
          document.onmousemove = null
          document.onmouseup = null
        }
      }
      document.onmouseleave = function() {
          document.onmousemove = null
          document.onmouseup = null
      }
    }
  }

  componentWillUnmount() {
    if (typeof(window) === 'object') {
      document.getElementById('chat-move').onmousedown = null
      document.onmouseleave = null
    }
  }

  routeChange(route) {
    this.setState({
      route
    })
  }

  render() {
    if (typeof(window) !== 'object') {
      return <div></div>
    }

    return (
      <div id="chat">
        <div className="chat-route">
          <div id="chat-move" className="cr-user-wrap">
            <div className="cr-user-avatar" style={{
              'background': `url(${HOST}/image/member/avatar/${this.props.auth.user.avatar}) center center / 30px 30px no-repeat`
            }}></div>
           <div className="cr-user-name">{this.props.auth.user.nickname}</div>
          </div>
          <div className="cr-routes-wrap">
            <div onClick={this.routeChange.bind(this, 'message')} className={classnames("crr-item", {
              'crr-select-bg': this.state.route === 'message'
            })}>
              <div className="crr-item-img"><img src={`${HOST}/image/ui/message.png`} /></div>
              <div className="crr-item-f"><span>消息</span></div>
            </div>
            <div onClick={this.routeChange.bind(this, 'contacts')} className={classnames("crr-item", {
              'crr-select-bg': this.state.route === 'contacts'
            })}>
              <div className="crr-item-img"><img src={`${HOST}/image/ui/user.png`} /></div>
              <div className="crr-item-f"><span>联系人</span></div>
            </div>
            <div onClick={this.routeChange.bind(this, 'search')} className={classnames("crr-item", {
              'crr-select-bg': this.state.route === 'search'
            })}>
              <div className="crr-item-img"><img src={`${HOST}/image/ui/monitor.png`} /></div>
              <div className="crr-item-f"><span>找人</span></div>
            </div>
          </div>
        </div>
        <div className="chat-body">
          <div className="chat-body-box">
            {
              this.state.route === 'message' ? <Message /> :
              this.state.route === 'contacts' ? <Contacts /> :
              this.state.route === 'search' ? <Search /> : null
            }
          </div>
        </div>
        <ChatWindow />
      </div>
    )
  }
}
function mapStateToProps(state) {
  return {
    auth: state.auth,
    // chat: state.chat
  }
}

Chat.propTypes = {
  auth: PropTypes.object.isRequired,
  // chat: PropTypes.object.isRequired
}

export default connect(mapStateToProps, { initContacts })(Chat)
