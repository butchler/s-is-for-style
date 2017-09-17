import React, { Component } from 'react'
import injectSheet from 'react-jss';

class TodoTextInput extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      text: this.props.text || ''
    }

    this.handleBlur = this.handleBlur.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    const text = e.target.value.trim()
    if (e.which === 13) {
      this.props.onSave(text)
      if (this.props.newTodo) {
        this.setState({ text: '' })
      }
    }
  }

  handleChange(e) {
    this.setState({ text: e.target.value })
  }

  handleBlur(e) {
    const text = e.target.value.trim()
    if (!this.props.newTodo) {
      this.props.onSave(text)
    }
  }

  render() {
    return (
      <Input
        newTodo={this.props.newTodo}
        type="text"
        autoFocus="true"
        placeholder={this.props.placeholder}
        value={this.state.text}
        onBlur={this.handleBlur}
        onChange={this.handleChange}
        onKeyDown={this.handleSubmit} />
    )
  }
}

export default TodoTextInput;

const Input = injectSheet({
  input: {
    position: 'relative',
    margin: 0,
    width: '100%',
    'font-size': '24px',
    'font-family': 'inherit',
    'font-weight': 'inherit',
    'line-height': '1.4em',
    outline: 'none',
    color: 'inherit',
    'box-sizing': 'border-box',
    'font-smoothing': 'antialiased',
    padding: props => props.newTodo ? '16px 16px 16px 60px' : '6px',
    border: props => props.newTodo ? 'none' : '1px solid #999',
    background: props => props.newTodo ? 'rgba(0, 0, 0, 0.003)' : undefined,
    'box-shadow': props => props.newTodo ? 'inset 0 -2px 1px rgba(0, 0, 0, 0.03)' : 'inset 0 -1px 5px 0 rgba(0, 0, 0, 0.2)',
  },
})(({ classes, sheet, newTodo, ...rest }) => <input className={classes.input} {...rest} />);
