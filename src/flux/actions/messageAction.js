// 弹出消息框
export const alertMessageAction = message => dispatch => {
  dispatch({
    type: 'ALERT_MESSAGE',
    payload: message
  })
}

export const closeAlertAction = () => dispatch => {
  dispatch({
    type: 'CLOSE_ALERT'
  })
}

// 弹出确认框
export const confirmMessageAction = (message, sure, cancel) => dispatch => {
  dispatch({
    type: 'CONFIRM_MESSAGE',
    payload: { message, sure, cancel }
  })
}

export const closeConfirmAction = () => dispatch => {
  dispatch({
    type: 'CLOSE_CONFIRM'
  })
}
