import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Styletron from 'styletron-client';
import { injectStyle } from 'styletron-utils';

function S(props, context) {
  const {
    tag,
    getRef,
    className,
    style,
    children,
    ...otherProps
  } = props;
  const Tag = tag || 'div';

  const styleClassNames = injectStyle(context.styletron, style);

  const combinedClassName = (
    (styleClassNames && className) ? `${styleClassNames} ${className}` :
    !className ? styleClassNames :
    className
  );

  return <Tag ref={getRef} className={combinedClassName} {...otherProps}>{children}</Tag>;
}

S.propTypes = {
  tag: PropTypes.string,
  style: PropTypes.object,
  className: PropTypes.string,
  children: PropTypes.node,
};

S.contextTypes = {
  styletron: PropTypes.object.isRequired,
};

export class SheetProvider extends Component {
  constructor() {
    super();

    this.styletron = new Styletron();
  }

  getChildContext() {
    return {
      styletron: this.styletron,
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
  styletron: PropTypes.object.isRequired,
};

export default S;
