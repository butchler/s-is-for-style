import { Router, Route, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom'
import React from 'react'

import App from './containers/App'
import configure from './store'

import { addTodo, completeAll, clearCompleted } from './actions/todos';

const timeMount = (store) => new Promise((resolve, reject) => {
  const history = syncHistoryWithStore(browserHistory, store);

  const startTime = window.performance.now();
  ReactDOM.render(
    <Provider store={store}>
      <Router history={history}>
        <Route path="*" component={App} />
      </Router>
    </Provider>,
    document.getElementById('root'), () => {
      setTimeout(() => {
        const endTime = window.performance.now()
        resolve(endTime - startTime);
      }, 0);
    }
  );
});

const timeUnmount = () => new Promise((resolve, reject) => {
  const startTime = window.performance.now();
  ReactDOM.unmountComponentAtNode(document.getElementById('root'));
  setTimeout(() => {
    const endTime = window.performance.now()
    resolve(endTime - startTime);
  }, 0);
});

const timeActions = (store) => new Promise((resolve, reject) => {
  const actions = [
    addTodo('a'),
    addTodo('test'),
    addTodo('this is only a test'),
    addTodo('日本語'),
    addTodo('a'),
    addTodo('test'),
    addTodo('this is only a test'),
    addTodo('日本語'),
    addTodo('a'),
    addTodo('test'),
    addTodo('this is only a test'),
    addTodo('日本語'),
    addTodo('a'),
    addTodo('test'),
    addTodo('this is only a test'),
    addTodo('日本語'),
    addTodo('a'),
    addTodo('test'),
    addTodo('this is only a test'),
    addTodo('日本語'),
    addTodo('a'),
    completeAll(),
    addTodo('test'),
    addTodo('this is only a test'),
    addTodo('日本語'),
    addTodo('a'),
    addTodo('test'),
    addTodo('this is only a test'),
    addTodo('日本語'),
    addTodo('a'),
    addTodo('test'),
    addTodo('this is only a test'),
    addTodo('日本語'),
    addTodo('a'),
    addTodo('test'),
    addTodo('this is only a test'),
    addTodo('日本語'),
    addTodo('a'),
    addTodo('test'),
    addTodo('this is only a test'),
    addTodo('日本語'),
    addTodo('a'),
    addTodo('test'),
    addTodo('this is only a test'),
    addTodo('日本語'),
    addTodo('a'),
    addTodo('test'),
    addTodo('this is only a test'),
    addTodo('日本語'),
    completeAll(),
    clearCompleted(),
  ];

  const doNextAction = () => {
    try {
      if (actions.length === 0) {
        const endTime = window.performance.now();
        resolve(endTime - startTime);
      } else {
        const nextAction = actions.shift();

        store.dispatch(nextAction);

        setTimeout(doNextAction, 0);
      }
    } catch (error) {
      reject(error);
    }
  };

  const startTime = window.performance.now();
  doNextAction();
});

const getStats = () => {
  const store = configure()
  const stats = {};

  return timeMount(store)
    .then(time => {
      stats.mount = time;
      return timeActions(store);
    })
    .then(time => {
      stats.actions = time;
      return timeUnmount();
    })
    .then(time => {
      stats.unmount = time;

      return stats;
    });
};

const repeatStats = (numRepeats) => new Promise((resolve, reject) => {
  const loop = (i = 0, allStats = []) => {
    if (i === numRepeats) {
      resolve(allStats);
    } else {
      getStats().then(stats => loop(i + 1, [stats, ...allStats]));
    }
  };

  loop();
});

window.test = () => {
  // Prime optimizer
  repeatStats(5)
    // Perform actual tests.
    .then(() => repeatStats(20))
    .then(allStats => {
      // Group stats into arrays of times, keyed by type (mount/actions/unmount).
      const allStatsByType = {};
      allStats.forEach(stats => {
        Object.keys(stats).forEach(key => {
          allStatsByType[key] = allStatsByType[key] ? [...allStatsByType[key], stats[key]] : [stats[key]];
        })
      });

      const types = Object.keys(allStatsByType);

      // Get median times.
      const mediansByType = {};
      types.forEach(type => {
        const sortedTimes = [...allStatsByType[type]].sort((a, b) => (
          a < b ? -1 :
          a > b ? 1 :
          0
        ));

        const median = sortedTimes[Math.floor(sortedTimes.length / 2)];

        mediansByType[type] = median;
      });

      console.log(mediansByType)
      console.table(allStats);
    });
};
