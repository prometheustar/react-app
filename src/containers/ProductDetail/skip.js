import React from 'react'
class Skip extends React.Component {
  componentWillMount() {
    this.props.history.push('/')
  }
  render() {
    return <div>页面跳转...</div>
  }
}
export default Skip
