const initialState = {
  contacts: [], // 联系人
  messagesNotRead: [],
  chatnow: undefined,
  messages: [],
  hideWindow: true,
  hideChat: true
}

const chatReducer = (state = initialState, action) => {
  switch(action.type) {
    case 'SEND_CHAT_MESSAGE_BACK':  // 发送消息回执
      return {
        ...state,
        messages: state.messages.map(i => {
          return i.userId !== action.payload.target ? i : {
            ...i,
            content: [...i.content, {sender: action.payload.origin, msg: action.payload.content}]
          }
        })
      }
    case 'RECEIVE_CHAT_MESSAGE': // 收到聊天消息
      var origin = state.messagesNotRead.find(i => i.userId === action.payload.origin)
      // 聊天人在未读列表中
      if (origin) {
        return {
          ...state,
          messagesNotRead: state.messagesNotRead.map(i => {
            return i.userId === action.payload.origin ? {
              ...i,
              notRead: i.notRead + 1,
              content: [...i.content, {sender: action.payload.origin, msg: action.payload.content}],
            } : i
          })
        }
      }
      origin = state.messages.find(i => i.userId === action.payload.origin)
       // 聊天对象在已读消息列表中
      if (origin) {
         // 是当前聊天对象
        if (origin.userId === state.chatnow) {
          return {
            ...state,
            messages: state.messages.map(i => {
              return i.userId === action.payload.origin ? {
                ...i,
                content: Array.isArray(i.content) ? i.content.concat([{sender: action.payload.origin, msg: action.payload.content}]) : [{sender: action.payload.origin, msg: action.payload.content}]
              } : i
            })
          }
        }else {
          // 不是当前聊天对象，转移到未读列表中
          var newMsg = [{sender: action.payload.origin, msg: action.payload.content}]
          return {
            ...state,
            messages: state.messages.filter(i => i.userId !== action.payload.origin),
            messagesNotRead: [{
              ...origin,
              content: Array.isArray(origin.content) ? origin.content.concat(newMsg) : newMsg,
              notRead: 1,
            }].concat(state.messagesNotRead)
          }
        }
      }
       // 聊天对象新来的
      return {
        ...state,
        messagesNotRead: [{
          userId: action.payload.origin,
          nickname: action.payload.nickname,
          avatar: action.payload.avatar,
          notRead: 1,
          content: [{sender: action.payload.origin, msg: action.payload.content}]
        }].concat(state.messagesNotRead)
      }
    case 'INIT_CONTACTS':
      var m = [], n = [];
      for (let i = 0, len = action.payload.length; i < len; i++) {
        if (action.payload[i].notRead > 0) {
          n.push(action.payload[i])
        }else {
          m.push(action.payload[i])
        }
      }
      return {
        ...state,
        messagesNotRead: n,
        messages: m
      }

    case 'MESSAGE_NOT_READ_ITEM_TO_CHAT': // 未读消息到聊天窗口
      return {
        ...state,
        chatnow: action.payload.userId,
        messagesNotRead: state.messagesNotRead.filter(i => i.userId !== action.payload.userId),
        messages: [action.payload].concat(state.messages),
        hideWindow: false
      }
    case 'CONTACT_ITEM_TO_CHAT': // 联系人和找人 item 到聊天窗口
      var newState = {
        ...state,
        chatnow: action.payload.userId,
        hideWindow: false,
        messagesNotRead: state.messagesNotRead.filter(i => {
          var here = i.userId !== action.payload.userId
            if (!here) {
              action.payload.content = i.content
            }
          return here
        }),
        messages: state.messages.filter(i => {
          var here = i.userId !== action.payload.userId
          if (!here) {
            action.payload.content = i.content
          }
          return here
        })
      }
      // 聊天人已在消息列表中
      if (newState.messagesNotRead.length !== state.messagesNotRead.length || newState.messages.length !== state.messages.length) {
        return {
          ...newState,
          messages: [action.payload].concat(newState.messages)
        }
      }
      // 不在消息列表中
      action.payload.content = []
      return {
        ...newState,
        messages: [action.payload].concat(state.messages)
      }

    case 'MESSAGE_ITEM_TO_CHAT':  // 已读消息到窗口
      return {
        ...state,
        chatnow: action.payload.userId,
        hideWindow: false
      }
    case 'SET_CONTACTS':  // 获得联系人
      return {
        ...state,
        contacts: action.payload
      }
    case 'SET_WAIT_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(i => {
          return i.userId === state.chatnow ? {...i, wait: action.payload} : i
        })
      }
    case 'TOGGLE_CHAT':
      return {
        ...state,
        hideChat: action.payload
      }
    case 'SWING_CHAT_WINDOW':
      return {
        ...state,
        hideWindow: action.payload
      }
    default:
      return state
  }
}
export default chatReducer
