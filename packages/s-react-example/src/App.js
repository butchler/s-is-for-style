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
    const color = this.state.red ? 'red' : 'blue';

    return (
      <S
        tag="button"
        style={{
          color,
          ':hover': {
            border: `3px solid ${color}`,
          },
          border: `3px solid black`,
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
