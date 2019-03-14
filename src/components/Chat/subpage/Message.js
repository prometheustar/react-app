import React from 'react'
import { connect } from 'react-redux'
import classnames from 'classnames'
import config from '../../../utils/config'
import { formatDate } from '../../../utils/tools'

import { messageNotReadItemToChatAction, messageItemToChatAction } from '../../../flux/actions/chatActions'
const HOST = config.HOST

function subMessage(message) {
  return message.length < 19 ? message.replace(/{{=\w+\.(jpg|png|icon|gif|jpeg)}}/g, '【图片】') : message.replace(/{{=\w+\.(jpg|png|icon|gif|jpeg)}}/g, '【图片】').substring(0,18) + '...'
}

const Message = props => {
  return (
    <div className="chat-msg-wrap">
      { // 未读消息
        [props.messagesNotRead.map((item, index) => (
          <div onClick={props.messageNotReadItemToChatAction(item)} key={index} className={classnames("msg-item", {
              'msg-item-select': item.userId === props.chatnow
            })}>
            <div className="msg-i-userwrap">
              <div className="msg-i-avatar" style={{
                background: `url(${HOST}/image/member/avatar/${item.avatar}) center center / 35px 35px no-repeat`
              }}></div>
              <div className="msg-i-nickname">{item.nickname}</div>
            </div>
            <div className="msg-i-wrap">
              <div className="msg-i-disone">{(Array.isArray(item.content) && item.content.length > 0 ? subMessage(item.content[item.content.length-1].msg) : '')}</div>
              <div className="msg-i-len">{item.notRead}</div>
            </div>
              <div className="msg-i-time">{Array.isArray(item.content) && item.content.length > 0 ? formatDate(item.content[item.content.length-1].creaTime) : ''}</div>
          </div>
        )), // 已读消息
          props.messages.map((item, index) => (
            <div onClick={props.messageItemToChatAction(item)} key={index} className={classnames("msg-item", {
              'msg-item-select': item.userId === props.chatnow
            })}>
              <div className="msg-i-userwrap">
                <div className="msg-i-avatar" style={{
                  background: `url(${HOST}/image/member/avatar/${item.avatar}) center center / 35px 35px no-repeat`
                }}></div>
                <div className="msg-i-nickname">{item.nickname}</div>
              </div>
              <div className="msg-i-wrap">
                <div className="msg-i-disone">{props.chatnow !== item.userId && item.wait ? subMessage(item.wait) : (Array.isArray(item.content) && item.content.length > 0 ? subMessage(item.content[item.content.length-1].msg) : '')}</div>
              </div>
            </div>
          ))
        ]
      }
    </div>
  )
}

function mapStateToProps(state) {
  return {
    messagesNotRead: Array.isArray(state.chat.messagesNotRead) ? state.chat.messagesNotRead : [],
    messages: Array.isArray(state.chat.messages) ? state.chat.messages : [],
    chatnow: state.chat.chatnow
  }
}

export default connect(mapStateToProps, { messageNotReadItemToChatAction, messageItemToChatAction })(Message)
