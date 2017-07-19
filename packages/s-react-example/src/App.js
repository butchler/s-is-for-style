import React, { Component } from 'react';
import createSheet from 's-sheet-client';
import S from 's-react';

class App extends Component {
  constructor() {
    super();

    this.state = {
      red: true,
    };

    this.onClick = () => this.setState(state => ({ red: !state.red }));

    this.sheet = createSheet();
  }

  render() {
    return (
      <S
        tag="button"
        style={this.state.red ? {
          color: 'red',
          ':hover': {
            border: '3px solid red',
          },
          border: '3px solid black',
        } : {
          color: 'blue',
        }}
        onClick={this.onClick}
        sheet={this.sheet}
      >
        test
      </S>
    );
  }
}

export default App;
