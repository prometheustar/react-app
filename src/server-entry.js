import React from 'react'
import App from './App'
import { Provider } from 'react-redux'
import { StaticRouter } from 'react-router-dom'
import store from './flux/store'

const createApp = (routerContext, url, initStore) => {
  return (
    <Provider store={initStore || store}>
      <StaticRouter context={routerContext} location={url}>
        <App />
      </StaticRouter>
    </Provider>
  )
}

export default createApp
