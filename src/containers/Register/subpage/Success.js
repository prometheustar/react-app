import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import config from '../../../utils/config'

const HOST = config.HOST

const RegisterSuccess = (props) => {
  return <div>
    <div style={{textAlign: 'center', marginTop: '30px'}}><span className="main_font1">优选注册</span></div>
    <div className="regi-success">
      <div className="rs-tit-logo"><img src={`${HOST}/image/ui/success.png`} alt=""/></div>
      <div className="rs-in-wrap">
        <div className="rs-tit">
          <div className="rs-tit-info">恭喜注册成功，你的账户为：</div>
        </div>
        <div className="rs-logname">登录名：<span className="rs-logname-imp">{props.phone}</span></div>
        <div className="rs-nickname">会员名：{props.nickname}</div>
        <div className="rs-operator">
          <div className="rs-to-home"><Link to="/">去逛逛</Link></div>
          <div className="rs-to-log"><Link to="/login">现在去登录</Link></div>
        </div>
      </div>

    </div>
  </div>
}

RegisterSuccess.propTypes = {
  phone: PropTypes.string.isRequired,
  nickname: PropTypes.string.isRequired,
}
export default RegisterSuccess
