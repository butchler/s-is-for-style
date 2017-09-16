import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createClientSheet } from 's-is-for-style';

class S extends Component {
  constructor() {
    super();

    this.state = {
      classNames: '',
    };
  }

  componentWillMount() {
    this.styleInstance = this.context.sheet.createStyleInstance();

    this.setState({
      classNames: this.styleInstance.setStyle(this.props.style),
    });
  }

  componentWillReceiveProps(nextProps) {
    const nextClassNames = this.styleInstance.setStyle(nextProps.style);

    this.setState({ classNames: nextClassNames });
  }

  componentWillUnmount() {
    // Remove all styles.
    this.styleInstance.setStyle(null);
  }

  render() {
    const {
      tag,
      getRef,
      className,
      // Exclude style and sheet from otherProps.
      // TODO: Pull sheet from context instead of props.
      style,
      sheet,
      ...otherProps
    } = this.props;
    const Tag = tag || 'div';
    const combinedClassName = (
      (className || '') +
      ((className && this.state.classNames) ? ' ' : '') +
      (this.state.classNames || '')
    );

    return <Tag ref={getRef} className={combinedClassName} {...otherProps}>{this.props.children}</Tag>;
  }
}

S.propTypes = {
  tag: PropTypes.string,
  style: PropTypes.object,
  className: PropTypes.string,
  children: PropTypes.node,
};

S.contextTypes = {
  // TODO: Add sheet shape.
  //sheet: PropTypes.shape(sheetShape).isRequired,
  sheet: PropTypes.object.isRequired,
};

export class SheetProvider extends Component {
  constructor() {
    super();

    this.sheet = createClientSheet();
  }

  getChildContext() {
    return {
      sheet: this.sheet,
    };
  }

  render() {
    return React.Children.only(this.props.children);
  }
}

SheetProvider.propTypes = {
  children: PropTypes.node,
};

SheetProvider.childContextTypes = {
  sheet: PropTypes.object.isRequired,
};

export default S;
