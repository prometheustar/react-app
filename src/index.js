import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'

import App from './App';
import store from './flux/store'

const ReactBody = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  )
}
// hydrate
ReactDOM.render(<ReactBody />, document.getElementById('react-body'));
