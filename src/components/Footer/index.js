import React from 'react'
import config from '../../utils/config'

import './index.scss'

const HOST = config.HOST

function gotoTop() {
  if (typeof window !== 'object') return;
  var height = document.documentElement.scrollHeight
  var ms = 9
  var interval = setInterval(function() {
    console.log()
    document.documentElement.scrollTop = height / 10 * ms
    ms --
  }, 50)
  setTimeout(function() {
    clearInterval(interval)
    document.documentElement.scrollTop = 0
  }, 500)
}

const Footer = () => {
  return (
    <div  className="body-bottom">
      <div className="footer-wrap">
        <p onClick={gotoTop} title="回到顶部" className="footer-logo"></p>
        <p>@版权所有:北大青鸟-T121&nbsp;&nbsp;叶谱&nbsp;&nbsp;周围&nbsp;&nbsp;唐铭佑</p>
        <div style={{
          height: '89px',
          background: `url(${HOST}/image/ui/body_footer.jpg) center center no-repeat`
        }}></div>
      </div>
    </div>
  )
}
export default Footer
