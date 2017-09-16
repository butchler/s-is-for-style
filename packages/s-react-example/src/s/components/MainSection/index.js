import React, { Component } from 'react'
import TodoItem from '../TodoItem'
import Footer from '../Footer'
import { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } from '../../constants/filters'
import S from 's-react'
import shared from './../../shared/style'

const TODO_FILTERS = {
  [SHOW_ALL]: () => true,
  [SHOW_ACTIVE]: todo => !todo.completed,
  [SHOW_COMPLETED]: todo => todo.completed
}

class MainSection extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = { filter: SHOW_ALL }

    this.handleClearCompleted = this.handleClearCompleted.bind(this);
    this.handleShow = this.handleShow.bind(this);
  }

  handleClearCompleted() {
    const atLeastOneCompleted = this.props.todos.some(todo => todo.completed)
    if (atLeastOneCompleted) {
      this.props.actions.clearCompleted()
    }
  }

  handleShow(filter) {
    this.setState({ filter })
  }

  renderToggleAll(completedCount) {
    const { todos, actions } = this.props

    const toggleAll = {
      ...shared.formEl,

      position: 'absolute',
      top: '-55px',
      left: '-12px',
      width: '60px',
      height: '34px',
      'text-align': 'center',
      border: 'none', /* Mobile Safari */

      ':before': {
        content: '"❯"',
        'font-size': '22px',
        color: '#e6e6e6',
        padding: '10px 27px 10px 27px',
      },

      ':checked:before': {
        color: '#737373',
      },

      /*
       * Hack to remove background from Mobile Safari.
       * Can't use it globally since it destroys checkboxes in Firefox
       */
      '@media screen and (-webkit-min-device-pixel-ratio:0)': {
        transform: 'rotate(90deg)',
        appearance: 'none',
        '-webkit-appearance': 'none',
      },
    };

    if (todos.length > 0) {
      return <S
        tag="input"
        style={toggleAll}
        type="checkbox"
        checked={completedCount === todos.length}
        onChange={actions.completeAll} />
    }
  }

  renderFooter(completedCount) {
    const { todos } = this.props
    const { filter } = this.state
    const activeCount = todos.length - completedCount

    if (todos.length) {
      return (
        <Footer completedCount={completedCount}
          activeCount={activeCount}
          filter={filter}
          onClearCompleted={this.handleClearCompleted}
          onShow={this.handleShow} />
      )
    }
  }

  render() {
    const { todos, actions } = this.props
    const { filter } = this.state

    const filteredTodos = todos.filter(TODO_FILTERS[filter])
    const completedCount = todos.reduce((count, todo) => {
      return todo.completed ? count + 1 : count
    }, 0)

    const main = {
      position: 'relative',
      zIndex: 2,
      borderTop: '1px solid #e6e6e6',
    };

    const normal = {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    };

    return (
      <S tag="section" style={main}>
        {this.renderToggleAll(completedCount)}
        <S tag="ul" style={normal}>
          {filteredTodos.map(todo =>
            <TodoItem key={todo.id} todo={todo} {...actions} />
          )}
        </S>
        {this.renderFooter(completedCount)}
      </S>
    )
  }
}

export default MainSection;
