import React, { Component } from 'react';
import PropTypes from 'prop-types';
import createInstance from 's-core';

class S extends Component {
  constructor() {
    super();

    this.state = {
      classNames: '',
    };
  }

  componentWillMount() {
    this.setStyles = createInstance(this.props.sheet);

    this.setState({
      classNames: this.setStyles(this.props.style),
    });
  }

  componentWillReceiveProps(nextProps) {
    const nextClassNames = this.setStyles(nextProps.style);

    this.setState({ classNames: nextClassNames });
  }

  componentWillUnmount() {
    // Remove all styles.
    this.setStyles(null);
  }

  render() {
    const {
      tag,
      className,
      // Exclude style and sheet from props.
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

    return <Tag className={combinedClassName} {...otherProps}>{this.props.children}</Tag>;
  }
}

S.propTypes = {
  tag: PropTypes.string,
  style: PropTypes.object,
  className: PropTypes.string,
  children: PropTypes.node,
  // TODO: Add sheet shape.
  //sheet: PropTypes.shape(sheetShape).isRequired,
  sheet: PropTypes.object.isRequired,
};

export default S;
