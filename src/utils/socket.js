import { setAuthToken } from './setAuth'
import {
  payOrderSuccessAction,
  getMyOrdersAction
} from '../flux/actions/orderActions'
import {
  setShopCarAction,
  setAddressAction
} from '../flux/actions/authActions'
import {
  // setWaitMessageAction,
  sendChatMessageBackAction,
  receiveChatMessageAction,
  getContactsAction,
  initContacts
} from '../flux/actions/chatActions'
import config from './config'

const WS_HOST = config.WS_HOST

const state = {
  initShopCar: true,
}

const socket = {
  status: 'close',
  ws: null,
  initSocket: function (token) {
    if (typeof(window) !== 'object' || !token) return;
    const ws = new WebSocket(`${WS_HOST}?token=${token}`)

    ws.onopen = function(e) {
      console.log('socket open')
      socket.status = 'open'
      setInterval(function() {  // 设置定时器更新 token
        if (socket.status !== 'open') { return }
        ws.send(JSON.stringify({
          type: 'transToken',
          target: 'koa'
        }))
      }, 1000*60*15)
      ws.send('{"type":"get_shop_cat"}') // 获取购物车信息
      ws.send('{"type":"init_chat_messages"}') // 获取聊天信息
    }

    ws.onmessage = function(e) {
      var msg = e.data
      try {
        msg = JSON.parse(msg)
      }catch(err) {
        return
      }
      switch(msg.type) {
        case 'transToken':
          return setAuthToken(msg.content)

        case 'payOrderSuccess':  // 付款成功服务端消息
          return payOrderSuccessAction(msg.content)

        case 'get_shop_cat':  // 获取购物车信息
          // if (!state.initShopCar) {
          //   // 添加购物车
          //   alertMessageBox('添加成功，在购物车等亲')
          // }
          // state.initShopCar = false
          return setShopCarAction(msg.content)

        case 'send_chat_message':  // 发送消息后回执
          return sendChatMessageBackAction(msg)

        case 'init_chat_messages':  // 初始化聊天信息
          return initContacts(msg.content)

        case 'receive_chat_message':  // 收到聊天消息
          return receiveChatMessageAction(msg)

        case 'get_contacts': // 收到联系人列表信息
          return getContactsAction(msg.content)

        case 'get_address':
          return setAddressAction(msg.content)
        case 'get_orders':
          return getMyOrdersAction(msg.content)
        default:
          return
      }
    }

    ws.onclose = function(e) {
      console.log('socket close!')
      socket.status = 'close'
    }

    ws.onerror = function(e) {
      console.error('socket error', e)
    }

    socket.ws = ws
  }
}

export default socket
