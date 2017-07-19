import React, { Component, PropTypes } from 'react';
import createInstance from 's-core';

class S extends Component {
  constructor() {
    super();

    this.state = {
      classNames: '',
    };
  }

  componentWillMount() {
    this.instance = createInstance(this.props.sheet);

    this.setState({
      classNames: this.instance.add(this.props.style),
    });
  }

  componentWillReceiveProps(nextProps) {
    const nextClassNames = this.instance.update(nextProps.style);

    this.setState({ classNames: nextClassNames });
  }

  componentWillUnmount() {
    this.instance.remove();
  }

  render() {
    const { tag, className, style, ...otherProps } = this.props;
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
  //sheet: PropTypes.shape(sheetShape).isRequired,
  sheet: PropTypes.object.isRequired,
};

export default S;
