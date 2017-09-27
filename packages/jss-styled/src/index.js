import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { create } from 'jss';
import presets from 'jss-preset-default';

const jss = create(presets());

export function styled(Tag, baseStyles, ...conditionalStyles) {
  // TODO: Remove & from nested styles?
  const styles = {};

  styles.base = baseStyles;

  for (let i = 0; i < conditionalStyles.length; i++) {
    const [_, conditionalStyle] = conditionalStyles[i];

    styles[`conditional-${i}`] = conditionalStyle;
  }


  const sheet = jss.createStyleSheet(styles);

  const baseStylesClassName = sheet.classes.base;

  const conditionalClassNames = conditionalStyles.map(([condition, styles], i) =>
    [condition, sheet.classes[`conditional-${i}`]]
  );

  class Styled extends Component {
    componentWillMount() {
      // TODO: Use SheetManager.
      sheet.attach();
    }

    render() {
      const {
        className,
        ...otherProps,
      } = this.props;

      let combinedClassName = baseStylesClassName;

      for (let i = 0; i < conditionalClassNames.length; i++) {
        const [condition, conditionalClassName] = conditionalClassNames[i];

        if (condition(this.props)) {
          combinedClassName += ` ${conditionalClassName}`;
        }
      }

      if (className) {
        combinedClassName += ` ${className}`;
      }

      // TODO: Allow tag to be a function of props.
      return <Tag className={combinedClassName} {...otherProps} />;
    }
  };

  Styled.propTypes = {
    className: PropTypes.string,
  };

  return Styled;
}

// TODO: Add ...switch(prop => value, { value: styles, ... }) helper?

// TODO: Proper provider.
export class StyledProvider extends Component {
  render() {
    return React.Children.only(this.props.children);
  }
}

StyledProvider.propTypes = {
  children: PropTypes.node,
};
