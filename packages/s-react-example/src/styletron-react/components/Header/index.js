import React, { Component } from 'react'
import TodoTextInput from '../TodoTextInput'
import { styled } from 'styletron-react'

class Header extends Component {
  constructor() {
    super();

    this.handleSave = this.handleSave.bind(this);
  }

  handleSave(text) {
    if (text.length) {
      this.props.addTodo(text)
    }
  }

  render() {
    return (
      <header>
        <H1>Todos</H1>
        <TodoTextInput
          newTodo
          onSave={this.handleSave}
          placeholder="What needs to be done?" />
      </header>
    )
  }
}

export default Header;

const H1 = styled('h1', {
  position: 'absolute',
  top: '-155px',
  width: '100%',
  fontSize: '100px',
  fontWeight: '100',
  textAlign: 'center',
  textRendering: 'optimizeLegibility',
  color: 'rgba(175, 47, 47, 0.15)',
});
