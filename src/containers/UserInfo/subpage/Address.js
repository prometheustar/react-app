import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import axios from 'axios'
import classnames from 'classnames'
import config from '../../../utils/config'
import socket from '../../../utils/socket'
import {
  isEmpty,
  isPhone,
  isLength,
  isEmail
} from '../../../utils/validator'
import { setRouterLocationAction } from '../../../flux/actions/authActions'

const HOST = config.HOST

var initState = {
  editState: -1, // >-1编辑 || -1添加
  detailAddress: '',
  postcode: '',
  receiveName: '',
  receivePhone: '',
  isDefault: false,
  errors: {}
}

class Address extends React.Component {
  constructor(props) {
    super(props)
    this.state = initState
  }
  componentWillMount() {
    this.props.setRouterLocationAction('/member/address')
    // if (this.props.memberId === -1) return;
    if (socket.status === 'open') {
      socket.ws.send(JSON.stringify({
        type: 'get_address'
      }))
    }
  }

  setDefailtChange(e) {
    this.setState({
      isDefault: e.target.checked
    })
  }

  formInputChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  editStateChange(_, item) {
    this.setState({
      editState: item._id,
      isDefault: !!item.isDefault,
      detailAddress: item.address,
      postcode: item.postcode,
      receivePhone: item.phone,
      receiveName: item.receiveName,
    })
  }
  deleteAddress(_, item) {
    if (socket.status !== 'open') {
      return this.setState({
        errors: { submit: '网络未连接' }
      })
    }
    if (this.state.editState === item._id) {
      this.setState(initState)
    }
    socket.ws.send(JSON.stringify({
      type: 'delete_address',
      content: item._id
    }))
  }

  cancelEdit() {
    this.setState(initState)
  }

  saveAddress() {
    var errors = {}
    if (!/^[\w\D]{5,200}$/.test(this.state.detailAddress)) {
      errors.detailAddress = '详细地址最少5位，最多200位'
    }
    if (!/^[1-9]\d{5}$/.test(this.state.postcode)) {
      errors.postcode = '邮编格式有误'
    }
    if (!isLength(this.state.receiveName, {min:2,max:10})) {
      errors.receiveName = '姓名填写有误'
    }
    if (!isPhone(this.state.receivePhone)) {
      errors.receivePhone = '手机号码填写有误'
    }
    if (socket.status !== 'open') {
      errors.submit = '网络未连接'
    }
    if (!isEmpty(errors)) {
      return this.setState({
        errors
      })
    }
    socket.ws.send(JSON.stringify({
      type: 'save_address',
      content: {
        ...this.state,
        errors: null
      }
    }))
    this.setState(initState)
  }

  render() {
    return (
      <div className="u-info">
        <div className="u-info-title">收货地址</div>
        <div className="u-add-form">
          <div className="u-add-sub">编辑收货地址</div>
          <div className="u-add-form-item u-add-textarea">
            <span>*详细地址:</span>
            <textarea onChange={this.formInputChange.bind(this)} value={this.state.detailAddress} name="detailAddress" placeholder="请输入详细地址信息，如道路、门牌号、小区、楼栋号、单元等信息" className="u-add-i-text"></textarea>
          </div>
          {
            this.state.errors.detailAddress && <div className="u-add-err">{this.state.errors.detailAddress}</div>
          }
          <div className="u-add-form-item">
            <span>*邮政编码:</span>
            <input onChange={this.formInputChange.bind(this)} value={this.state.postcode} name="postcode" placeholder="请编写邮编" className="u-add-i-text" type="text"/>
          </div>
          {
            this.state.errors.postcode && <div className="u-add-err">{this.state.errors.postcode}</div>
          }
          <div className="u-add-form-item">
            <span>*收货人姓名:</span>
            <input onChange={this.formInputChange.bind(this)} value={this.state.receiveName} name="receiveName" placeholder="长度不超过10个字符" className="u-add-i-text" type="text"/>
          </div>
          {
            this.state.errors.receiveName && <div className="u-add-err">{this.state.errors.receiveName}</div>
          }
          <div className="u-add-form-item">
            <span>*手机号码:</span>
            <input onChange={this.formInputChange.bind(this)} value={this.state.receivePhone} name="receivePhone" placeholder="收货时的手机号码" className="u-add-i-text" type="text"/>
          </div>
          {
            this.state.errors.receivePhone && <div className="u-add-err">{this.state.errors.receivePhone}</div>
          }
          <div className="default-check">
             <input className="u-add-checkbox" onChange={this.setDefailtChange.bind(this)} checked={this.state.isDefault} type="checkbox"/>
            <div className="u-add-text">默认收货地址：</div>
          </div>
          <div>
            <button onClick={this.saveAddress.bind(this)} className="save-btn">{this.state.editState === -1 ? '添加': '保存'}</button>
            {
              this.state.editState === -1 ? null : <button onClick={this.cancelEdit.bind(this)} className="save-btn cancel-btn">取消</button>
            }
          </div>
          {
            this.state.errors.submit && <div className="u-add-err">{this.state.errors.submit}</div>
          }
        </div>
        <div className="u-address-table-wrap">
          <div className="u-add-sub">我的收货地址</div>
          <table border="1" width="750" style={{borderColor: '#eee', textAlign: 'center'}} cellSpacing="0" cellPadding="0">
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
              this.props.address.map((item, index) => {
                return (
                  <tr className={classnames({'default-ads': item.isDefault === 1})} key={index}>
                    <td>{item.receiveName}</td>
                    <td className="detail-address">{item.address}</td>
                    <td>{item.postcode}</td>
                    <td>{item.phone}</td>
                    <td>
                      <span onClick={this.editStateChange.bind(this, null, item)} className="add-edit-state">编辑</span>
                      <span> / </span>
                      <span onClick={this.deleteAddress.bind(this, null, item)} className="add-edit-state">删除</span>
                    </td>
                  </tr>
                )
              })
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
    address: state.auth.address || [],
    memberId: state.auth.user._id === undefined ? -1 : state.auth.user._id
  }
}
Address.propTypes = {
  address: PropTypes.array.isRequired,
  memberId: PropTypes.number.isRequired
}
export default connect(mapStateToProps, { setRouterLocationAction })(Address)
