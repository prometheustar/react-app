/**
 * 评论组件
 */
import React from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import config from '../../utils/config'
import socket from '../../utils/socket'
import { alertMessageAction } from '../../flux/actions/messageAction'

import './index.scss'
const HOST = config.HOST

class CommentBox extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      type: -1, // 0 好评，1中评，2差评
      comment: '',
      pictures: [],
      errors: {}
    }
    this.commentTypeChange = this.commentTypeChange.bind(this)
  }

  componentWillMount() {
    if (this.props.orderDetailId === -1) {
      this.props.closeCommentBox()
    }
  }

  commentChange(e) {
    var comment = e.target.value
    if (comment.length > 200) return;
    this.setState({
      comment
    })
  }

  pictureChange(e) {
    var picture = e.target.files[0]
    if (!picture || this.state.pictures.length >= 5) return;
    if (!/^image\//.test(picture.type)) {
      return this.setState({ errors:{...this.state.errors, picture: '文件类型不是图片'} })
    }else if (picture.size > 5000000) {
      return this.setState({ errors:{...this.state.errors, picture: '图片超过5M，无法上传'} })
    }
    var formData = new FormData()
    formData.append('picture', picture)
    this.setState({
      pictures: [...this.state.pictures, 'wait.gif']
    }, () => {
      axios.post(`${HOST}/api/order/comment_picture`, formData)
        .then(res => {
          if (!res.data.success) {
            this.setState({ pictures: this.state.pictures.filter(p => p !== 'wait.gif'), errors:{...this.state.errors, picture: res.data.message} })
          }
          this.setState({
            pictures: this.state.pictures.map((picture, i) => {
              return picture === 'wait.gif' ? res.data.payload.picture : picture
            }),
            errors: {...this.state.errors, picture: ''}
          })
        })
        .catch(err => {
          this.setState({
            errors: {...this.state.errors, picture: err.message}
          })
        })
    })
  }

  choicePicture(e) {
    if (this.state.pictures.length >= 5) {
      e.preventDefault()
    }
  }

  deletePicture(picture) {
    this.setState({
      pictures: this.state.pictures.filter(item => item !== picture)
    })
  }

  commentTypeChange(e) {
    this.setState({
      type: e.target.value
    })
  }

  submitComment() {
    var errors = {}
    if (['0', '1', '2'].indexOf(this.state.type) === -1) {
      errors.type = '亲，请选择评论类型'
    }
    if (this.state.comment.length > 200) {
      errors.comment = '字数不能超过200字'
    }
    if (Object.keys(errors).length > 0) {
      return this.setState({ errors })
    }
    axios.post(`${HOST}/api/order/submit_comment`, {
      type: this.state.type,
      comment: this.state.comment,
      pictures: this.state.pictures,
      orderDetailId: this.props.orderDetailId
    }).then(res => {
      if (!res.data.success) {
        return this.setState({ errors: {submit: res.data.message} })
      }
      // 评论成功
      console.log(res)
      if (socket.status === 'open') {
        socket.ws.send(JSON.stringify({
          type: 'get_orders',
          content: {limit: this.props.limit}
        }))
      }
      this.props.alertMessageAction('评论已提交')
      this.props.closeCommentBox()

    }).catch(err => {
      return this.setState({ errors: {submit: err.message} })
    })
  }

  render() {
    return (
      <div className="comment-box">
        <div className="cb-com-wrap">
          <div className="cb-com-0">
            <input onChange={this.commentTypeChange} id="type0" name="type" value="0" type="radio"/>
            <label htmlFor="type0">好评</label>
          </div>
          <div className="cb-com-1">
            <input onChange={this.commentTypeChange} id="type1" name="type" value="1" type="radio"/>
            <label htmlFor="type1">中评</label>
          </div>
          <div className="cb-com-2">
            <input onChange={this.commentTypeChange} id="type2" name="type" value="2" type="radio"/>
            <label htmlFor="type2">差评</label>
          </div>
        </div>
        {
          this.state.errors.type && <div className="cb-err">{this.state.errors.type}</div>
        }
        <div className="text-wrap">
          <textarea onChange={this.commentChange.bind(this)} value={this.state.comment} placeholder="亲，写点评价吧。" name="comment" id="" cols="30" rows="10"></textarea>
          <div className="text-len">{200 - this.state.comment.length} 字</div>
        </div>
        {
          this.state.errors.comment && <div className="cb-err">{this.state.errors.comment}</div>
        }
        <div className="cb-img-wrap">
          <div className="cb-file">
            <input onClick={this.choicePicture.bind(this)} onChange={this.pictureChange.bind(this)} hidefocus="true" className="file-input" type="file"/>
            <span>晒照片</span>
          </div>
          <div className="cb-pic-wrap">
          {
            this.state.pictures.map((picture, index) => {
              return (<div className="cb-pic-item" onClick={this.deletePicture.bind(this, picture)} key={index}>
                  <img src={`${HOST}/image/${picture === 'wait.gif' ? 'ui/wait.gif' : 'goods/comment/' + picture + '_w40.jpg'}`}/>
              </div>)
            })
          }
          </div>
          <div className="cb-pic-last">{this.state.pictures.length === 0 ? '限5张' : 5-this.state.pictures.length + '/5'}</div>
        </div>
        {
          this.state.errors.picture && <div className="cb-err">{this.state.errors.picture}</div>
        }
        <div className="cb-btn-wrap">
          <div className="cb-btn-sub" onClick={this.submitComment.bind(this)}>提交评论</div>
          <div className="cb-btn-cancel" onClick={this.props.closeCommentBox}>取消</div>
        </div>
        {
          this.state.errors.submit && <div className="cb-err">{this.state.errors.submit}</div>
        }
      </div>
    )
  }
}

export default connect(null, { alertMessageAction })(CommentBox)
