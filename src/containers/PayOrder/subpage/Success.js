import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import config from '../../../utils/config'

const HOST = config.HOST

const Success = (props) => {
  console.log(props)
  return <div>
    <div style={{textAlign: 'center', marginTop: '30px'}}><span className="main_font1">付款成功</span></div>
    <div className="regi-success">
      <div className="rs-tit-logo"><img src={`${HOST}/image/ui/success.png`} alt=""/></div>
      <div className="rs-in-wrap">
        <div className="rs-tit">
          <div className="rs-tit-info">付款成功，您的包裹已整装待发。。。</div>
        </div>
        <div className="rs-operator">
          <div className="rs-to-home"><Link onClick={props.payOrderEnd} to="/member/myorder">查看我的订单</Link></div>
          <div className="rs-to-log"><Link onClick={props.payOrderEnd} to="/">继续逛逛</Link></div>
        </div>
      </div>

    </div>
  </div>
}

function mapActionToProps(dispatch) {
  return {
    payOrderEnd: function() {
      dispatch({
        type: 'PAY_ORDER_SUCCESS'
      })
    }
  }
}
export default connect(null, mapActionToProps)(Success)
