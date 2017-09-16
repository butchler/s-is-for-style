
import React, { Component } from 'react'
import TodoTextInput from '../TodoTextInput'
import classnames from 'classnames'
import styles from './style'
import useSheet from 'react-jss'

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
    const {todo, completeTodo, deleteTodo, sheet: {classes}} = this.props

    let element
    if (this.state.editing) {
      element = (
        <TodoTextInput text={todo.text}
           editing={this.state.editing}
           onSave={(text) => this.handleSave(todo.id, text)} />
      )
    } else {
      element = (
        <div className={classnames({[classes.hideView]: this.state.editing})}>
          <input className={classnames(classes.toggle, classes.toggleDevice)}
             type="checkbox"
             checked={todo.completed}
             onChange={() => completeTodo(todo.id)} />

          <label className={classnames(classes.label, { [classes.completedLabel]: todo.completed})} onDoubleClick={this.handleDoubleClick}>
            {todo.text}
          </label>

          <button className={classnames(classes.destroy, 'destroy')} onClick={() => deleteTodo(todo.id)} />
        </div>
      )
    }

    // TODO: compose
    const liClasses = classnames(classes.normal, {
      [classes.completed]: todo.completed,
      [classes.editing]: this.state.editing
    })

    return (
      <li className={liClasses}>
        {element}
      </li>
    )
  }
}

export default useSheet(styles)(TodoItem)
