import React from 'react'
import config from '../../utils/config'
const HOST = config.HOST

const style = {
  width: '400px',
  height: '200px',
  background: `url(${HOST}/image/ui/loading.gif) center center / 400px 200px no-repeat`,
  position: 'fixed',
  left:'50%',
  top: '50%',
  zIndex: '99999',
  margin: '-100px 0 0 -200px'
}

const Loading = props => {
  return (<div style={style} className="loading-box">

  </div>)
}

export default Loading
