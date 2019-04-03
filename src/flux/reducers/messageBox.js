const initialState = {
  showAlert: false,  // 消息框
  message: '',
  showConfirm: false, // 确认框
  confirmMessage: '',
  sure: null,  // 确认函数
  cancel: null  // 取消函数
}

const messageBoxReducer = (state = initialState, action) => {
  switch(action.type) {
    case 'ALERT_MESSAGE':
      return {
        ...state,
        showAlert: true,
        message: action.payload
      }
    case 'CLOSE_ALERT':
      return {
        ...state,
        showAlert: false,
        message: ''
      }
    case 'CONFIRM_MESSAGE':
      return {
        ...state,
        showConfirm: true,
        confirmMessage: action.payload.message || '',
        sure: action.payload.sure || null,
        cancel: action.payload.cancel || null
      }
    case 'CLOSE_CONFIRM':
      return {
        ...state,
        showConfirm: false,
        confirmMessage: '',
        sure: null,
        cancel: null
      }
    default:
      return state
  }
}

export default messageBoxReducer
