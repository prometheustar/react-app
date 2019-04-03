import React from 'react'
import { connect } from 'react-redux'
import { Link, Route, Switch } from 'react-router-dom'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import config from '../../utils/config'
import PrivateRoute from '../../components/PrivateRoute'

import './index.scss'
import Header from '../../components/Header'
import Safety from './subpage/Safety'
import MyInfo from './subpage/MyInfo'
import Address from './subpage/Address'
import MyOrder from './subpage/MyOrder'

const HOST = config.HOST
/**
 * 安全设置
 *    修改手机，关闭手机登陆
 * 个人资料
 * 编辑资料
 * 收货地址
 * 资金管理
 */

class UserInfo extends React.Component {
  render() {
    // 未登陆，并且未在验证中
    // warning无法在现有状态转换期间更新(如在“render”中)。渲染方法应该是道具和状态的纯函数。
    // if (!this.props.auth.isLogin && !this.props.auth.isVerify) { this.props.history.push('/login') }

    return (
      <div>
        <Header />
        <div className="member-header">
          {/*头部*/}
          <div className="member-header-wrap">
            <div><img height="34px" width="140px" src={`${HOST}/image/ui/member-logo.png`} alt=""/></div>
            <div className="mh-choice-box">
              <Link to="/member">
                <div className="member-header-home">首页</div>
              </Link>
            </div>
          </div>
        </div>
        {
          !this.props.auth.isLogin ?
          <div>加载中。。。</div> :
          <div className="member-wrap">
            {/*导航区*/}
            <div className="member-nav">
              <div className="mn-avatar"><img src={`${HOST}/image/member/avatar/${this.props.auth.user.avatar}`} alt=""/></div>
              <ul className="mn-navselect">
                <li className={classnames({
                  'mn-navselected': this.props.location.pathname === '/member/safety'
                })}><Link to="/member/safety">安全设置</Link></li>
                <li className={classnames({
                  'mn-navselected': this.props.location.pathname === '/member'
                })}><Link to="/member">个人资料</Link></li>
                <li className={classnames({
                  'mn-navselected': /^\/member\/myorder/.test(this.props.location.pathname)
                })}><Link to="/member/myorder">我的订单</Link></li>
                <li className={classnames({
                  'mn-navselected': this.props.location.pathname === '/member/address'
                })}><Link to="/member/address">收货地址</Link></li>
              </ul>
            </div>
            {/*信息展示区*/}
            <div className="member-info">
              <Switch>
                <PrivateRoute path="/member" exact component={MyInfo} />
                <PrivateRoute path="/member/safety" component={Safety} />
                <PrivateRoute path="/member/address" component={Address} />
                <PrivateRoute path="/member/myorder" component={MyOrder} />
              </Switch>
            </div>
          </div>
        }
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth
  }
}
UserInfo.propTypes = {
  auth: PropTypes.object.isRequired
}
export default connect(mapStateToProps)(UserInfo)
