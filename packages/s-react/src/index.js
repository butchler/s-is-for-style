import React, { Component } from 'react';
import PropTypes from 'prop-types';

// TODO: Allow getting element ref.
class S extends Component {
  constructor() {
    super();

    this.state = {
      classNames: '',
    };
  }

  componentWillMount() {
    this.styleInstance = this.props.sheet.createStyleInstance();

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
