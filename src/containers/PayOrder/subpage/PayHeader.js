import React from 'react'
import { connect } from 'react-redux'
import config from '../../../utils/config'

const HOST = config.HOST

const PayHeader = (props) => {
  return (
    <header className="pay-header">
      <div className="pay-head-box">
        <div className="pay-head-tit f_wrap">
          <div className="pay-logo f_l"><img src={`${HOST}/image/ui/logo_60x60.png`} /></div>
          <div className="pay-logo-font f_r">优选 收银台</div>
        </div>
        <div className="pay-user">账户：{props.nickname}</div>
      </div>
    </header>
  )
}

function mapStateToProps(state) {
  return {
    nickname: state.auth.user.nickname
  }
}
export default connect(mapStateToProps)(PayHeader)
