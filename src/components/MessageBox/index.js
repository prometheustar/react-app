/**
 * 在页面中显示消息，显示 1.5 秒后消失
 */
import React from 'react'
import { connect } from 'react-redux'

import { closeAlertAction } from '../..//flux/actions/messageAction'
import './index.scss'

class MessageBox extends React.Component {

  componentDidMount() {
    var box = this.refs.messageBox
    var _this = this
    setTimeout(function() {
      var opacity = 1
      var interval = setInterval(function() {
        opacity -= 0.1
        box.style.opacity = opacity
      }, 100)
      setTimeout(function() {
        clearInterval(interval)
        _this.props.closeAlertAction()
      }, 1000)
    }, 500)
  }

  render() {
    return (
      <div ref="messageBox" className="message-box">
        {this.props.messageBox.message}
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    messageBox: state.messageBox
  }
}
export default connect(mapStateToProps, { closeAlertAction })(MessageBox)
