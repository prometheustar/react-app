import store from '../store'
import socket from '../../utils/socket'

export const toggleChatAction = state => { // 隐藏或显示聊天窗口
  store.dispatch({
    type: 'TOGGLE_CHAT',
    payload: state
  })
}

export const initContacts = messages => {
  store.dispatch({
    type: 'INIT_CONTACTS',
    payload: messages
  })
}

// 点击未读消息展示到聊天框
export const messageNotReadItemToChatAction = item => dispatch => {
  return function() {
    if (socket.status === 'open') {
      socket.ws.send(JSON.stringify({ // 设置消息已读
        type: 'msg_be_read',
        content: item.userId
      }))
    }
    dispatch({
      type: 'MESSAGE_NOT_READ_ITEM_TO_CHAT',
      payload: item
    })
  }
}

export const sendingMessageAction = msg => dispatch => {
  dispatch({
    type: 'PUT_SENDING_MESSAGE',
    payload: msg
  })
}

// 点击已读消息展示到聊天框
export const messageItemToChatAction = item => dispatch => {
  return function() {
    dispatch({
      type: 'MESSAGE_ITEM_TO_CHAT',
      payload: item
    })
  }
}

// 点击联系人和找人 item 到聊天框
export const contactItemToChatAction = item => {
  item = {...item, userId: item.userId || item.contactId}
  var chat = store.getState().chat
  if (chat.chatnow === item.userId && !chat.hideChat) return;

  store.dispatch({
    type: 'CONTACT_ITEM_TO_CHAT',
    payload: item
  })
}

export const swingChatWindowAction = hide => dispatch => {
  dispatch({
    type: 'SWING_CHAT_WINDOW',
    payload: hide
  })
}

export const setWaitMessageAction = msg => dispatch => {
  dispatch({
    type: 'SET_WAIT_MESSAGE',
    payload: msg
  })
}

// 发送消息后回执
export const sendChatMessageBackAction = message => {
  store.dispatch({
    type: 'SEND_CHAT_MESSAGE_BACK',
    payload: message
  })
}

// 收到聊天消息
export const receiveChatMessageAction = message => {
  if (message.origin === store.getState().chat.chatnow && socket.status === 'open') {
    socket.ws.send(JSON.stringify({
      type: 'msg_be_read',
      content: message.origin
    }))
  }
  store.dispatch({
    type: 'RECEIVE_CHAT_MESSAGE',
    payload: message
  })
}

// 收到联系人列表
export const getContactsAction = contacts => {
  store.dispatch({
    type: 'SET_CONTACTS',
    payload: contacts
  })
}
