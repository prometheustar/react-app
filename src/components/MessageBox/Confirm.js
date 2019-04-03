/**
 * 确认或取消
 */
import React from 'react'
import { connect } from 'react-redux'
import { closeConfirmAction } from '../../flux/actions/messageAction'

function limitMessage(message) {
  if (typeof(message) !== 'string') {
    return ''
  }
  return message.length < 31 ? message : message.substring(0,30) + '...'
}

const Confirm = props => {

  var sureBtnClick = function() {
    if (typeof(props.sure) === 'function') {
      props.sure()
    }
    props.closeConfirmAction()
  }

  var cancelBtnClick = function() {
    props.closeConfirmAction()
    if (typeof(props.cancel) === 'function') {
      props.cancel()
    }
  }

  return (
    <div className="confirm-box">
      <div className="msg-content">{limitMessage(props.confirmMessage)}</div>
      <div className="btn-wrap">
        <div onClick={sureBtnClick} className="btn-yes">确认</div>
        <div onClick={cancelBtnClick} className="btn-cancel">取消</div>
      </div>
    </div>
  )
}

function mapStateToProps(state) {
  return {
    confirmMessage: state.messageBox.confirmMessage,
    sure: state.messageBox.sure,
    cancel: state.messageBox.cancel,
  }
}

export default connect(mapStateToProps, { closeConfirmAction })(Confirm)
