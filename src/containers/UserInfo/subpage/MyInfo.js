import React from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import PropTypes from 'prop-types'

import { getDate, formatDate } from '../../../utils/tools'
import { updateUserInfo } from '../../../flux/actions/authActions'
import { alertMessageAction } from '../../../flux/actions/messageAction'
import config from '../../../utils/config'
const HOST = config.HOST

function transDate(date, type) {
  if (typeof(date) !== 'string') return null;
  date = new Date(date)
  if (Number.isNaN(date.getDate())) return null;
  if (type === 'year') return date.getFullYear()
  if (type === 'month') return date.getMonth() + 1
  if (type === 'day') return date.getDate()
  return null
}

var sending = false // 记录消息是否发送中
class MyInfo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: {},
      birthDate: null,
      birthMonth: null,
      birthYear: null,
      reallyName: '',
      idCard: '',
      avatar: '',
      gender: -1,
      years: [1940, 1941, 1942, 1943, 1944, 1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953, 1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962, 1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971, 1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019],
      month: [1,2,3,4,5,6,7,8,9,10,11,12],
      days: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31],
      errors: {
        message: ''
      }
    }
    this.genderRadioChange = this.genderRadioChange.bind(this)
    this.birthChange = this.birthChange.bind(this)
    this.diff = this.diff.bind(this)
  }

  componentWillMount() {
    // 请求个人资料
    axios.get(`${HOST}/api/users/user_info`)
      .then(res => {
        if (!res.data.success) {
          return this.setState({
            errors: {...this.state.errors, message: res.data.message}
          })
        }
        var user = res.data.payload.userInfo
        this.setState({
          birthYear: transDate(user.birth, 'year'), birthMonth: transDate(user.birth, 'month'), birthDate: transDate(user.birth, 'day'), avatar: user.avatar,
          gender: user.gender,
          user,
        })
      })
      .catch(err => {
        this.setState({
          errors: {...this.state.errors, message: err.message}
        })
      })
  }

  componentDidMount() {
    document.title = '我的优选-个人资料'
  }

  genderRadioChange(e) {
    this.setState({
      gender: parseInt(e.target.value)
    })
  }

  reallyNameInputChange(e) {
    this.setState({
      reallyName: e.target.value
    })
  }

  idCardInputChange(e) {
    this.setState({
      idCard: e.target.value
    })
  }

  birthChange(e) {
    var name = e.target.name
    var value = e.target.value
    var days = null
    // 年份和日期已选择，计算天数
    if (name === 'birthMonth' && this.state.birthYear) {
      days = getDate(this.state.birthYear, value)

    }else if (name === 'birthYear' && this.state.birthMonth) {
      days = getDate(value, this.state.birthMonth)
    }
    this.setState({
      [name]: Number(value),
      days: days || this.state.days
    })
  }

  avatarChange(e) {
    var avatar = e.target.files[0]
    var errors = {}
    if (avatar && !/^image\/(jpeg|png|gif|x-icon)$/.test(avatar.type)) {
      errors.avatar = "选择的文件类型不是图片"
    }
    if (avatar && avatar.size > 5000000) {
      errors.avatar = "图片大小不能超过5M"
    }
    if (Object.keys(errors).length > 0) {
      return this.setState({
        errors: {...this.state.errors, avatar: errors.avatar}
      })
    }

    var formData = new FormData()
    formData.append('picture', avatar)
    formData.append('type', 'avatar')
    axios.post(`${HOST}/api/users/save_chat_image`, formData)
      .then(res => {
        if (!res.data.success) {
          return this.setState({
            errors: {...this.state.errors, avatar: res.data.message}
          })
        }
        this.setState({
          avatar: res.data.payload
        })
      })
      .catch(err => {
        return this.setState({
            errors: {...this.state.errors, avatar: err.message}
          })
      })
  }

  // 用户信息是否改变
  diff() {
    var birth = new Date(this.state.user.birth)
    var diff = {}
    if (this.state.reallyName !== "")
        diff.reallyName = this.state.reallyName
    if (this.state.idCard !== "")
        diff.idCard = this.state.idCard
    if (this.state.avatar !== this.state.user.avatar)
        diff.avatar = this.state.avatar
    if (this.state.gender !== this.state.user.gender)
      diff.gender = this.state.gender
    if (
      this.state.birthYear !== birth.getFullYear() ||
      this.state.birthMonth !== birth.getMonth() +1 ||
      this.state.birthDate !== birth.getDate()
    ) {
      diff.birthYear = this.state.birthYear
      diff.birthMonth = this.state.birthMonth
      diff.birthDate = this.state.birthDate
    }
    return Object.keys(diff).length > 0 ? diff : false
  }

  formSubmit(e) {
    e.preventDefault()
    var diff = this.diff()
    if (!diff) {
      return;
    }
    if (sending) {
      return this.props.alertMessageAction("更改中。。。")
    }
    var errors = {}
    if (diff.reallyName && !/^[\u4e00-\u9fa5]{2,5}$/.test(diff.reallyName)) {
      errors.reallyName = '真实姓名格式有误'
    }
    if (diff.idCard && !/^\d{18}$/.test(diff.idCard)) {
      errors.idCard = '身份证格式有误'
    }
    if (diff.avatar && this.state.avatar !== "default.jpg" && !/^\w{10}_\d{8}\.(jpg|jpeg|png|icon|gif)$/.test(diff.avatar)) {
      errors.avatar = '头像有误'
    }
    if (diff.gender && !/^[012]$/.test(diff.gender)) {
      errors.gender = '请选择性别'
    }
    if (diff.birthYear && (!/^(19|20)\d{2}$/.test(diff.birthYear) || !/^([1-9]|1[012])$/.test(diff.birthMonth) || !/^([1-9]|[1-2][0-9]|3[01])$/.test(diff.birthDate))) {
      errors.birth = '日期格式有误'
    }else if (diff.birthYear) {
      diff.birth = `${diff.birthYear}-${diff.birthMonth}-${diff.birthDate}`
      delete diff.birthYear
      delete diff.birthMonth
      delete diff.birthDate
    }
    if (Object.keys(errors).length > 0) {
      return this.setState({ errors })
    }

    sending = true
    axios.post(`${HOST}/api/users/modify_userinfo`, diff)
      .then(res => {
        sending = false
        if (!res.data.success) {
          return this.setState({
            errors: {...this.state.errors, submit: res.data.message}
          })
        }
        var user = res.data.payload.userInfo
        this.setState({
          birthYear: transDate(user.birth, 'year'), birthMonth: transDate(user.birth, 'month'), birthDate: transDate(user.birth, 'day'), avatar: user.avatar,
          gender: user.gender,
          reallyName: '',
          idCard: '',
          user
        }, () => {
          this.props.alertMessageAction('修改成功！')
          this.props.updateUserInfo(user)
        })
      })
      .catch(err => {
        sending = false
        this.setState({
          errors: {submit: err.message}
        })
      })
  }

  render() {
    return (
      <div className="my-info-wrap">
        <div className="mi-base-tit">基本资料</div>
        {
          this.state.errors.message && <div className="mi-err">{this.state.errors.message}</div>
        }
        <form className="mi-form" name="baseInfoForm" method="post" onSubmit={this.formSubmit.bind(this)}>
          <div className="mi-nickname">
            <span>亲爱的</span>
            <span className="mi-nickname-b">{this.state.user.nickname}</span>
            <span>，填写真实的资料，有助于好友找到你哦。</span>
          </div>
          <div className="mi-avatar mi-item">
            <div className="mi-item-sub">当前头像：</div>
            <div className="mi-avatar-wrap mi-item-body">
              <img src={`${HOST}/image/member/avatar/${this.state.avatar}`} alt="当前头像"/>
              <div className="mi-avatar-btn">
                <input onChange={this.avatarChange.bind(this)} type="file" hidefocus="true"/>
              </div>
            </div>
          </div>
          {
            this.state.errors.avatar && <div className="mi-err">{this.state.errors.avatar}</div>
          }
          <div className="mi-reallyName mi-item">
            <div className="mi-r-a mi-item-sub">真实姓名：</div>
            <div className="mi-item-body mi-r-input">
              <input onChange={this.reallyNameInputChange.bind(this)} placeholder={this.state.user.reallyName} value={this.state.reallyName} type="text"/>
            </div>
          </div>
          {
            this.state.errors.reallyName && <div className="mi-err">{this.state.errors.reallyName}</div>
          }
          <div className="mi-reallyName mi-item">
            <div className="mi-r-a mi-item-sub">身份证号：</div>
            <div className="mi-item-body mi-r-input">
              <input onChange={this.idCardInputChange.bind(this)} placeholder={this.state.user.idCard} value={this.state.idCard} type="text"/>
            </div>
          </div>
          {
            this.state.errors.idCard && <div className="mi-err">{this.state.errors.idCard}</div>
          }
          <div className="mi-gender mi-item">
            <div className="mi-gender-l mi-item-sub">性别：</div>
            <div className="mi-gender-r mi-item-body">
              <label htmlFor="gender0">
                <input onChange={this.genderRadioChange} checked={this.state.gender === 0} id="gender0" value="0" name="gender" type="radio"/>
                男
              </label>
              <label htmlFor="gender1">
                <input onChange={this.genderRadioChange} checked={this.state.gender === 1} id="gender1" value="1" name="gender" type="radio"/>
                女
              </label>
              <label htmlFor="gender2">
                <input onChange={this.genderRadioChange} checked={this.state.gender === 2} id="gender2" value="2" name="gender" type="radio"/>
                保密
              </label>
            </div>
          </div>
          {
            this.state.errors.gender && <div className="mi-err">{this.state.errors.gender}</div>
          }
          <div className="mi-birth-wrap mi-item">
            <div className="mi-item-sub">生日：</div>
            <div className="mi-birth-body mi-item-body">
              <select className="mi-birth-year" onChange={this.birthChange} value={this.state.birthYear || '0'} name="birthYear" id="birth_year">
                <option defaultValue="0">年</option>
                {
                  this.state.years.map((year, index) => (
                    <option key={index} defaultValue={year}>{year}</option>
                  ))
                }
              </select>
              <select onChange={this.birthChange} value={this.state.birthMonth || '0'} name="birthMonth" id="birth_year">
                <option defaultValue="0">月</option>
                {
                  this.state.month.map((month, index) => (
                    <option key={index} defaultValue={month}>{month}</option>
                  ))
                }
              </select>
              <select onChange={this.birthChange} value={this.state.birthDate || '0'} name="birthDate" id="birth_year">
                <option defaultValue="0">日</option>
                {
                  this.state.days.map((day, index) => (
                    <option key={index} defaultValue={day}>{day}</option>
                  ))
                }
              </select>
            </div>
          </div>
          {
            this.state.errors.birth && <div className="mi-err">{this.state.errors.birth}</div>
          }
          <div className="mi-reallyName mi-item">
            <div className="mi-r-a mi-item-sub">最后登录时间：</div>
            <div className="mi-item-body">{formatDate(this.state.user.lastLogin, true)}</div>
          </div>
          {
            !this.diff() ? null: <div>
              <button type="submit" className="mi-submit">保存</button>
              {
                this.state.errors.submit ? <div className="mi-err">{this.state.errors.submit}</div> : null
              }
            </div>

          }
        </form>
      </div>
    )
  }
}

MyInfo.propTypes = {
  user: PropTypes.object.isRequired
}

function mapStateToProps(state) {
  return {
    user: state.auth.user || {}
  }
}

export default connect(mapStateToProps, { updateUserInfo, alertMessageAction })(MyInfo)
