import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Header from '../../components/Header'
import MainSection from '../../components/MainSection'
import * as TodoActions from '../../actions/todos'
import S, { SheetProvider } from 's-react'

class App extends Component {

  render() {
    const { todos, actions, children } = this.props

    const normal = {
      background: '#fff',
      margin: '200px 0 40px 0',
      position: 'relative',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 25px 50px 0 rgba(0, 0, 0, 0.1)',
    };

    return (
      <SheetProvider>
        <div>
          <S tag="div" style={normal}>
            <Header addTodo={actions.addTodo} />
            <MainSection todos={todos} actions={actions} />
            {children}
          </S>
        </div>
      </SheetProvider>
    )
  }
}

function mapStateToProps(state) {
  return {
    todos: state.todos
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(TodoActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
