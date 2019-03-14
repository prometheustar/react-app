import React from 'react'
import { connect } from 'react-redux'
import { setRouterLocationAction } from '../../../flux/actions/authActions'

const EditMyInfo = function (props) {
  props.setRouterLocationAction('/member/edit_myinfo')

  return (
    <div>EditMyInfo</div>
  )
}
export default connect(null, { setRouterLocationAction })(EditMyInfo)
