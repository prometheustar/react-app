import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import axios from 'axios'
import config from '../../../utils/config'

import { setRouterLocationAction } from '../../../flux/actions/authActions'

const HOST = config.HOST


class Address extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      address: [],
      message: ''
    }
  }
  componentWillMount() {
    this.props.setRouterLocationAction('/member/address')
    if (this.props.memberId === -1) return;
    // 请求收货地址
    axios.post(HOST + '/api/users/address', {memberId: this.props.memberId})
      .then(res => {
        if (res.data.success) {
          this.setState({
            address: res.data.payload,
            message: ''
          })
        }else {
          this.setState({
            address: [],
            message: res.data.message
          })
        }
      })
      .catch(err => {
        this.setState({
          address: [],
          message: err.message
        })
      })
  }
  render() {
    return (
      <div>
        <div>收货地址</div>
        <div><span>编辑收货地址</span></div>
        <div>
          <span>详细地址:</span>
          <input type="text"/>
        </div>
        <div>
          <span>邮政编码:</span>
          <input type="text"/>
        </div>
        <div>
          <span>收货人姓名:</span>
          <input type="text"/>
        </div>
        <div>
          <span>手机号码:</span>
          <input type="text"/>
        </div>
        <div>
          <input type="checkbox"/>
          <span>默认收货地址：</span>
        </div>
        <button>保存</button>
        <div>
          <table>
            <thead>
              <tr>
                <th>收货人</th>
                <th>详细地址</th>
                <th>邮编</th>
                <th>电话/手机</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
            {
              this.state.address.map((item, index) => (
                <tr key={index}>
                  <td>{item.receiveName}</td>
                  <td>{item.address}</td>
                  <td>{item.postcode}</td>
                  <td>{item.phone}</td>
                  <td>编辑/删除</td>
                </tr>
              ))
            }
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}
function mapStateToProps(state) {
  return {
    address: state.auth.address,
    memberId: state.auth.user._id === undefined ? -1 : state.auth.user._id
  }
}
Address.propTypes = {
  address: PropTypes.array.isRequired,
  memberId: PropTypes.number.isRequired
}
export default connect(mapStateToProps, { setRouterLocationAction })(Address)
