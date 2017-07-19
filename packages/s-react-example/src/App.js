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
    const buttons = [];

    for (let i = 0; i < 1000; i++) {
      buttons.push(<MyButton key={i} red={this.state.red} onClick={this.onClick} sheet={this.sheet} />);
      //buttons.push(<MyButtonInline key={i} red={this.state.red} onClick={this.onClick} sheet={this.sheet} />);
    }

    return <div>{buttons}</div>;
  }
}

function MyButton({ red, onClick, sheet }) {
  return (
    <div>
      <S
        tag="button"
        style={red ? {
          color: 'red',
          ':hover': {
            border: '3px solid red',
          },
          border: '3px solid black',
        } : {
          color: 'blue',
        }}
        onClick={onClick}
        sheet={sheet}
      >
        test
      </S>
    </div>
  );
}

function MyButtonInline({ red, onClick }) {
  return (
    <div>
      <button
        style={red ? {
          color: 'red',
          border: '3px solid black',
        } : {
          color: 'blue',
        }}
        onClick={onClick}
      >
        test
      </button>
    </div>
  );
}

export default App;
