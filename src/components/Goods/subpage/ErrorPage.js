import React from 'react'

const ErrorPage = (props) => {
  return (
    <div>
      <h2>错误：{props.message}</h2>
    </div>
  )
}
export default ErrorPage
