import { Router, Route, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom'
import React from 'react'

import AppControl from './control/containers/App'
import AppJSS from './jss/containers/App'
import AppJSS2 from './jss-2/containers/App'
import AppS from './s/containers/App'
import AppStyletron from './styletron/containers/App'
import AppStyletronReact from './styletron-react/containers/App'

import configure from './jss/store'
import { addTodo, completeAll, clearCompleted } from './jss/actions/todos';

const timeMount = (AppComponent, store) => new Promise((resolve, reject) => {
  const history = syncHistoryWithStore(browserHistory, store);

  const startTime = window.performance.now();
  ReactDOM.render(
    <Provider store={store}>
      <Router history={history}>
        <Route path="*" component={AppComponent} />
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

const getStats = (AppComponent, store) => {
  return timeActions(store).then(time => ({ actions: time }));
};

const repeatStats = (AppComponent, numRepeats) => {
  const store = configure();

  const loopActions = () => new Promise((resolve, reject) => {
    const loop = (i = 0, allStats = []) => {
      if (i === numRepeats) {
        resolve(allStats);
      } else {
        getStats(AppComponent, store).then(stats => loop(i + 1, [stats, ...allStats]));
      }
    };

    loop();
  });

  return timeMount(AppComponent, store).then(loopActions).then(allStats => {
    return timeUnmount().then(() => allStats);
  });
};

const testApp = (AppComponent) => (
  repeatStats(AppComponent, 25)
    .then(allStats => {
      // Drop first few stats, since they might not have been optimized.
      return allStats.slice(5);
    })
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
    })
    .then(() => new Promise(resolve => setTimeout(resolve, 500)))
);

window.test = () => {
  document.querySelector('#root').style.display = 'none';

  Promise.resolve()
    .then(() => {
      console.log('Testing control...');
      return testApp(AppControl);
    })
    .then(() => {
      console.log('Testing JSS...');
      return testApp(AppJSS);
    })
    .then(() => {
      console.log('Testing JSS 2 (no classnames module)...');
      return testApp(AppJSS2);
    })
    .then(() => {
      console.log('Testing S...');
      return testApp(AppS);
    })
    .then(() => {
      console.log('Testing S-Styletron...');
      return testApp(AppStyletron);
    })
    //.then(() => {
      //console.log('Testing Styletron-React...');
      //return testApp(AppStyletronReact);
    //});
};
