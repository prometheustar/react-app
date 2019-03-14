import React from 'react'
import { connect } from 'react-redux'

import { contactItemToChatAction } from '../../../flux/actions/chatActions'
import socket from '../../../utils/socket'
import config from '../../../utils/config'
const HOST = config.HOST

// 点击联系人到聊天框
function contactClick(item) {
  return function() {
    contactItemToChatAction(item)
  }
}

const Contacts = (props) => {
  if (socket.status === 'open') {
    socket.ws.send(JSON.stringify({
      type: 'get_contacts'
    }))
  }
  const online = []
  const offline = []
  props.contacts.forEach(i => {
    if (i.isOnline) {
      online.push(i)
    }else {
      offline.push(i)
    }
  })
  return (
    <div>
      {
        props.contacts.length < 1 ? <div>你还没有联系人哦...</div> :
        [
          online.map((item, index) => (
            <div key={index} onClick={contactClick(item)} className="chat-contact-item">
              <div className="chatcon-il"><img src={`${HOST}/image/member/avatar/${item.avatar}`}/></div>
              <p title={item.nickname} className="chatcon-ir">{item.nickname}</p>
            </div>
          )),
          offline.map((item, index) => (
            <div key={index} onClick={contactClick(item)} className="chat-contact-item chat-item-offline">
              <div className="chatcon-il"><img src={`${HOST}/image/member/avatar/${item.avatar}`}/></div>
              <p title={item.nickname} className="chatcon-ir">{item.nickname}</p>
            </div>
          ))
        ]
      }
    </div>
  )

}

// class Contacts extends React.Component {
//   componentWillMount() {
//     // socket 请求 联系人列表
//     if (socket.status === 'open') {
//       socket.ws.send(JSON.stringify({
//         type: 'get_contacts'
//       }))
//     }
//   }
//   // 点击联系人到聊天框
//   contactClick(item) {
//     contactItemToChatAction(item)
//   }
//   render() {
//     const online = []
//     const offline = []
//     this.props.contacts.forEach(i => {
//       if (i.isOnline) {
//         online.push(i)
//       }else {
//         offline.push(i)
//       }
//     })
//     return (
//       <div>
//         {
//           this.props.contacts.length < 1 ? <div>你还没有联系人哦...</div> :
//           [
//             online.map((item, index) => (
//               <div key={index} onClick={this.contactClick.bind(this, item)} className="chat-contact-item">
//                 <div className="chatcon-il"><img src={`${HOST}/image/member/avatar/${item.avatar}`}/></div>
//                 <p title={item.nickname} className="chatcon-ir">{item.nickname}</p>
//               </div>
//             )),
//             offline.map((item, index) => (
//               <div key={index} onClick={this.contactClick.bind(this, item)} className="chat-contact-item chat-item-offline">
//                 <div className="chatcon-il"><img src={`${HOST}/image/member/avatar/${item.avatar}`}/></div>
//                 <p title={item.nickname} className="chatcon-ir">{item.nickname}</p>
//               </div>
//             ))
//           ]
//         }
//       </div>
//     )
//   }
// }
function mapStateToProps(state) {
  return {
    contacts: Array.isArray(state.chat.contacts) ? state.chat.contacts : []
  }
}

export default connect(mapStateToProps)(Contacts)
