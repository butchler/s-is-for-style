import React, { Component } from 'react'
import TodoTextInput from '../TodoTextInput'
import S from 's-react-styletron';
import shared from './../../shared/style'

class TodoItem extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      editing: false
    }

    this.handleDoubleClick = this.handleDoubleClick.bind(this);
  }

  handleDoubleClick() {
    this.setState({ editing: true })
  }

  handleSave(id, text) {
    if (text.length === 0) {
      this.props.deleteTodo(id)
    } else {
      this.props.editTodo({ id, text })
    }
    this.setState({ editing: false })
  }

  render() {
    const {todo, completeTodo, deleteTodo } = this.props

    let element
    if (this.state.editing) {
      element = (
        <TodoTextInput text={todo.text}
           editing={this.state.editing}
           onSave={(text) => this.handleSave(todo.id, text)} />
      )
    } else {
      const toggle = {
        ...shared.formEl,

        'text-align': 'center',
        width: '40px',
        /* auto, since non-WebKit browsers doesn't support input styling */
        height: 'auto',
        position: 'absolute',
        top: 0,
        bottom: 0,
        margin: 'auto 0',
        border: 'none', /* Mobile Safari */
        appearance: 'none',
        '-webkit-appearance': 'none',

        ':after': {
          content: 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="-10 -18 100 135"><circle cx="50" cy="50" r="50" fill="none" stroke="#ededed" stroke-width="3"/></svg>\')',
        },

        ':checked:after': {
          content: 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="-10 -18 100 135"><circle cx="50" cy="50" r="50" fill="none" stroke="#bddad5" stroke-width="3"/><path fill="#5dc2af" d="M72 25L42 71 27 56l-4 4 20 20 34-52z"/></svg>\')',
        },

        '@media screen and (-webkit-min-device-pixel-ratio:0)': {
          background: 'none',
          height: '40px',
        },
      };

      const label = {
        'white-space': 'pre-line',
        'word-break': 'break-all',
        padding: '15px 60px 15px 15px',
        'margin-left': '45px',
        display: 'block',
        'line-height': '1.2',
        transition: 'color 0.4s',

        color: todo.completed ? '#d9d9d9' : undefined,
        'text-decoration': todo.completed ? 'line-through' : undefined,
      };

      const destroy = {
        ...shared.button,
        ...shared.formEl,

        display: 'none',
        position: 'absolute',
        top: 0,
        right: '10px',
        bottom: 0,
        width: '40px',
        height: '40px',
        margin: 'auto 0',
        'font-size': '30px',
        color: '#cc9a9a',
        'margin-bottom': '11px',
        transition: 'color 0.2s ease-out',

        ':hover': {
          color: '#af5b5e',
        },

        ':after': {
          content: '"×"',
        },
      };

      element = (
        <div>
          <S tag="input" style={toggle}
             type="checkbox"
             checked={todo.completed}
             onChange={() => completeTodo(todo.id)} />

          <S tag="label" style={label} onDoubleClick={this.handleDoubleClick}>
            {todo.text}
          </S>

          <S tag="button" className="destroy" style={destroy} onClick={() => deleteTodo(todo.id)} />
        </div>
      );
    }

    const liStyle = {
      position: 'relative',
      'font-size': '24px',
      'border-bottom': this.state.editing ? 'none' : '1px solid #ededed',
      padding: this.state.editing ? 0 : undefined,

      ':last-child': {
        'border-bottom': 'none',
        'margin-bottom': this.state.editing ? '-1px' : undefined,
      },

      // TODO: Remove class selector
      ':hover .destroy': {
        display: 'block',
      },
    };

    return (
      <S tag="li" style={liStyle}>
        {element}
      </S>
    )
  }
}

export default TodoItem;
