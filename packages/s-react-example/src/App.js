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
  //const style = red ? (
    //{
      //color: 'red',
      //':hover': {
        //border: '3px solid red',
      //},
      //border: '3px solid black',
      //'@media (min-width: 500px)': {
        //color: 'green',
      //},
    //}
  //) : (
    //{
      //color: 'blue',
    //}
  //);

  const style = red ? (
    {
      color: 'red',
      border: '3px solid black',
    }
  ) : (
    {
      color: 'blue',
    }
  );

  return (
    <div>
      <S
        tag="button"
        style={style}
        onClick={onClick}
        sheet={sheet}
      >
        csscss
      </S>
    </div>
  );
}

function MyButtonInline({ red, onClick }) {
  const style = red ? (
    {
      color: 'red',
      border: '3px solid black',
    }
  ) : (
    {
      color: 'blue',
    }
  );

  return (
    <div>
      <button
        style={style}
        onClick={onClick}
      >
        inline
      </button>
    </div>
  );
}

export default App;
