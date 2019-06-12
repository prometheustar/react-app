import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import config from '../../../utils/config'

const HOST = config.HOST

var payEnd = false

class Success extends React.Component {

  componentWillUnmount() {
    if (!payEnd) {
      this.props.payOrderEnd()
    }
  }

  render() {
    return <div className="pay-success-wrap">
      {/*<div style={{textAlign: 'center', marginTop: '30px'}}><span className="main_font1">付款成功</span></div>*/}
      <div className="pays-body">
        <div className="f_wrap pays-logo">
          <div className="f_l pays-logo-l"><img src={`${HOST}/image/ui/success2.png`} /></div>
          <div className="f_l pays-logo-r">您已成功付款</div>
        </div>
        <div className="pays-opera">
          <div className="pays-circle pays-info">您的包裹已整装待发。。。</div>
          <div className="pays-circle pays-price">
            <span className="pays-f1">实付款：</span>
            <span className="pays-f2">￥{this.props.sumPrice}</span>
          </div>
          <div className="pays-end">
            <span className="pays-f1">您可以</span>
            <span className=""><Link className="pays-f3" onClick={this.props.payOrderEnd} to="/member/myorder">查看已买到的宝贝</Link></span>
            <span className=""><Link className="pays-f3" onClick={this.props.payOrderEnd} to="/">继续逛逛</Link></span>
          </div>
        </div>

      </div>
    </div>
  }
}


function mapActionToProps(dispatch) {
  return {
    payOrderEnd: function() {
      payEnd = true
      dispatch({
        type: 'PAY_ORDER_SUCCESS'
      })
    }
  }
}

function mapStateToProps(state) {
  return {
    sumPrice: state.order.payOrder.sumPrice
  }
}
export default connect(mapStateToProps, mapActionToProps)(Success)
