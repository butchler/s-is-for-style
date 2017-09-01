import { Router, Route, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom'
import React from 'react'

import App from './containers/App'
import configure from './store'

const store = configure()
const history = syncHistoryWithStore(browserHistory, store)

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route path="*" component={App} />
    </Router>
  </Provider>,
  document.getElementById('root'), () => {
      if (process.env.NODE_ENV === 'production') {
        // In production, remove the server-side generated styles and let
        // the live app take over (for auto-mount/unmount and lazy-loading)
        // TODO
        //const ssStyles = document.getElementById('server-side-styles')
        //ssStyles.parentNode.removeChild(ssStyles)
      }
  }
)
