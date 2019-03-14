import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import axios from 'axios'

import config from '../../../utils/config'
import wss from '../../../utils/socket'
import { swingChatWindowAction, setWaitMessageAction } from '../../../flux/actions/chatActions'
const HOST = config.HOST

function readFile(file, callback) {
  var reader = new FileReader()
  //以二进制形式读取文件
  reader.readAsArrayBuffer(file)
  reader.onload = function(e) {
    callback(e.target.result)
  }
}

function transMessage(msg) {
  // {{=xx.jpg}}  => <img src="xx.jpg'">
  if (msg === '' || typeof(msg) !== 'string') return msg
  var images = null
  try {
    // images = msg.match(/(?<!{{=)\w+\.(jpg|jpeg|gif|png|icon)(?=}})/g)
    images = msg.match(/\w+\.(jpg|jpeg|gif|png|icon)(?=}})/g)
  }catch(err) {
    // firefox 不支持正则前置断言
    images = msg.match(/\w+\.(jpg|jpeg|gif|png|icon)(?=}})/g)
  }
  if (images) {
    var msgs = msg.split(/{{\=\w+\.[jpgenifco]{3,4}}}/g)
    msg = msgs[0]
    for (var i = 1, len = msgs.length; i < len; i++) {
      msg += `<img src="${HOST}/image/member/chat/${/\.gif$/.test(images[i-1]) ? images[i-1] : images[i-1] + '_w80.jpg'}">${msgs[i]}`
    }
  }
  return msg
}

class ChatWindow extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      message: ''
    }
    this.scrollToButton = this.scrollToButton.bind(this)
  }

  static getDerivedStateFromError(error) {
    console.log(error)
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.log(error, info)
    // logErrorToMyService(error, info);
  }

  componentDidMount() {
    if (typeof(window) !== 'object') return;
    this.refs.textarea.ondragenter = function (e) {
      e.preventDefault()
    }
    this.refs.textarea.ondragleave = function(e) {
      e.preventDefault()
    }
    this.refs.textarea.ondragover = function(e) {
        e.preventDefault();
    }
    var _this = this
    this.refs.textarea.ondrop = function(e) {
      e.preventDefault()
      e.stopPropagation() // 火狐浏览器，拖动时打开新页面
      if (!_this.props.chat.chatnow) return;
      var file = e.dataTransfer.files[0]
      if (!file || file.size > '5048576‬') {
        return; // 5M 以下的文件
      }else if (!/^image\/(jpeg|png|gif|x-icon)$/.test(file.type)) {
        return; // 不支持的格式
      }
      var formData = new FormData()
      formData.append('picture', file)
      axios.post(`${HOST}/api/users/save_chat_image`, formData)
        .then(res => {
          if (res.data.success) {
            _this.props.setWaitMessageAction(_this.refs.textarea.innerHTML += `<img src="${HOST}/image/member/chat/${res.data.payload}_w80.jpg">`)
          }
        })
        .catch(err => {
          console.error(err)
        })
    }
  }

  componentWillUnmount() {
    if (typeof(window) !== 'object') return;
    this.refs.textarea.ondragenter = null
    this.refs.textarea.ondragleave = null
    this.refs.textarea.ondragover = null
    this.refs.textarea.ondrop = null
  }

  // 聊天对象改变时，拿出未发送消息
  componentWillReceiveProps(nextProps) {
    if (typeof(window) !== 'object') { return }
    var chat = this.props.chat
    // 将消息中的 wait 提取出
    if (chat.chatnow !== nextProps.chat.chatnow) {
      var now = nextProps.chat.messages.find(i => i.userId === nextProps.chat.chatnow)
      if (now && now.wait) {
        // this.refs.textarea.classList.remove('textarea-f1')
        this.refs.textarea.innerHTML = now.wait
      }else {
        this.refs.textarea.innerText = ''
      }
      // 将消息滚动条，到最低
      this.scrollToButton()
    }else {
      var msgNow = chat.messages.find(i => i.userId === chat.chatnow)
      var msgNext = nextProps.chat.messages.find(i => i.userId === nextProps.chat.chatnow)
      if (msgNow && msgNext && Array.isArray(msgNow.content) && Array.isArray(msgNext.content) && msgNow.content.length !== msgNext.content.length) {
        // 将消息滚动条，到最低
        this.scrollToButton()
      }
    }
    this.refs.textarea.focus()
  }
  scrollToButton() {
      var _this = this
        // 这里 render 还没执行，页面中组件
      setTimeout(function() {
        // console.log(_this.refs.chatMessageBox.scrollTop, _this.refs.chatMessageBox.scrollHeight)
        _this.refs.chatMessageBox.scrollTop = _this.refs.chatMessageBox.scrollHeight
        setTimeout(function() {
        // console.log(_this.refs.chatMessageBox.scrollTop, _this.refs.chatMessageBox.scrollHeight)
          _this.refs.chatMessageBox.scrollTop = _this.refs.chatMessageBox.scrollHeight
        }, 200)
      }, 100)
  }
  // 隐藏这个窗口
  swingChatWindow() {
    this.props.swingChatWindowAction(true)
  }

  sendMessage() {
    var message = this.refs.textarea.innerHTML
    if (message === '' || !this.props.chat.chatnow) return;
    // /(?<!\<img src="http:\/\/[\d\.]+\/image\/member\/chat\/)\w+\.(gif|png|jpg|jpeg|ico)(?=_w80\.jpg">)/g
    var images = message.match(/\w+?\.(gif|png|jpg|jpeg|ico)(?=_w80\.jpg">)/g)
    // return console.log(images)
    if (images) {
      var msgs = message.split(/<img src="[\w\W]+?_w80\.jpg">/)
      message = msgs[0]
      var img = ''
      for (var i = 1, len = msgs.length; i < len; i++) {
        message += `{{=${images[i-1]}}}${msgs[i]}`
      }
    }
    message = message.replace(/(<\/span>|<span[^>]+?>)/g, '').replace(/(<\/div>|<div[^>]*?>)/g, '')
    if (wss.status !== 'open') {
      return this.setState({
        messages: '与服务器断开连接'
      })
    }
    this.refs.textarea.innerText = '' // 清空消息
    this.props.setWaitMessageAction('')
    wss.ws.send(JSON.stringify({
      type: 'send_chat_message',
      origin: this.props.user.userId,
      target: this.props.chat.chatnow,
      content: message
    }))
  }

  // textareaFocus(e) {

  // }
  // textareaBlur(e) {

  // }

  textareaInput(e) {
    this.props.setWaitMessageAction(e.target.innerHTML)
  }
  render() {
    let chat = this.props.chat
    let chatnow = undefined
    if (chat.chatnow && Array.isArray(chat.messages)) {
      chatnow = chat.messages.find(i => i.userId === chat.chatnow)
    }
    return (
      <div className="chat-window" style={{
        display: chat.hideWindow ? 'none' : 'block'
      }}>
        <div className="chatw-header">
          <div onClick={this.swingChatWindow.bind(this)} className="charw-hide" style={{
            background: `url(${HOST}/image/ui/left.png) center center / 25px 25px no-repeat #628ef9`
          }}></div>
          <div className="chatw-h-targetname">{chatnow && chatnow.nickname}</div>
        </div>
        <div className="chatw-show-scroll-wrap">
        <div ref="chatMessageBox" className="chatw-show-wrap">
        {
          chatnow && chatnow.content.map((item, index) => (
            <div className="chat-chatnow-wrap" key={index}>
              {
                item.sender === chatnow.userId ? (
                  <div className="chat-target-wrap">
                    <div className="chat-target" key="1">
                      <div className="chat-ta-avatar" style={{
                        background: `url(${HOST}/image/member/avatar/${chatnow.avatar}) center center / 30px 30px no-repeat`
                      }}></div>
                      <div className="chat-ta-nickname">{chatnow.nickname}</div>
                    </div>
                    <div className="chat-msg-target" dangerouslySetInnerHTML={{__html: transMessage(item.msg)}} key="2"></div>
                  </div>
                ) : (
                  <div className="chat-me-wrap">
                    <div className="chat-me" key="1">
                      <div className="chat-me-avatar" style={{
                        background: `url(${HOST}/image/member/avatar/${chatnow.avatar}) center center / 30px 30px no-repeat`
                      }}></div>
                      <div className="chat-me-nickname">{this.props.user.nickname}</div>
                    </div>
                    <div className="chat-msg-me" dangerouslySetInnerHTML={{__html: transMessage(item.msg)}} key="2"></div>
                  </div>
                )
              }
            </div>
          ))
        }</div>
        </div>
        <div className="chatw-send-wrap">
          <div className="chatw-s-textarea">
            <div id="textarea"
              ref="textarea"
              // onFocus={this.textareaFocus.bind(this)}
              // onBlur={this.textareaBlur.bind(this)}
              onInput={this.textareaInput.bind(this)}
              contentEditable={!!chatnow}
              suppressContentEditableWarning="true"></div>
          </div>
          <div className="chatw-s-sendbox">
            <div onClick={this.sendMessage.bind(this)} className="chatw-s-sendbtn">发送</div>
          </div>
        </div>
      </div>
    )
  }
}
function mapStateToProps(state) {
  return {
    user: state.auth.user,
    chat: state.chat
  }
}

ChatWindow.propTypes = {
  user: PropTypes.object.isRequired,
  chat: PropTypes.object.isRequired,
  setWaitMessageAction: PropTypes.func.isRequired,
  swingChatWindowAction: PropTypes.func.isRequired
}
export default connect(mapStateToProps, { swingChatWindowAction, setWaitMessageAction })(ChatWindow)
