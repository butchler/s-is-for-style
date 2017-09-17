import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createClientSheet } from 's-is-for-style';

class S extends Component {
  componentWillMount() {
    window.time && window.time('start');
    this.styleInstance = this.context.sheet.createStyleInstance();
    window.time && window.time('end');
  }

  componentWillUnmount() {
    // Remove all styles.
    window.time && window.time('start');
    this.styleInstance.setStyle(null);
    window.time && window.time('end');
  }

  render() {
    const {
      tag,
      getRef,
      className,
      style,
      ...otherProps
    } = this.props;
    const Tag = tag || 'div';

    window.time && window.time('start');
    const styleClassNames = this.styleInstance.setStyle(style);
    window.time && window.time('end');

    const combinedClassName = (
      (styleClassNames && className) ? `${styleClassNames} ${className}` :
      !className ? styleClassNames :
      className
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

  componentWillUnmount() {
    // Hack to remove all styles we added.
    createClientSheet();
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
