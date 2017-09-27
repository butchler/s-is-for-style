import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { create } from 'jss';
import presets from 'jss-preset-default';

const jss = create(presets());

export function withClasses(styleSheet/*, TODO: options */) {
  const { jssStyleSheet, classNameToJSSClassNames } = createJSSStyleSheet(styleSheet);

  // TODO: Make proper JSS provider.
  const sheet = jss.createStyleSheet(jssStyleSheet).attach();

  const classes = {};

  Object.keys(styleSheet).forEach(className => {
    const generatedClassNames = classNameToJSSClassNames[className]
      .map(jssClassName => sheet.classes[jssClassName])
      .join(' ');

    // TODO: Conditional and dynamic styles.
    classes[className] = () => generatedClassNames;
  });

  return (WrappedComponent) => {
    // TODO: Add sheet when component is mounted using SheetManager.
    function WithClasses(props) {
      return <WrappedComponent classes={classes} {...props} />
    }

    WithClasses.displayName = `WithClasses(${WrappedComponent.displayName || WrappedComponent.name || 'undefined'})`;

    return WithClasses;
  };
}

// TODO: Make proper JSS provider.
export class JSSProvider extends Component {
  render() {
    return React.Children.only(this.props.children);
  }
}

JSSProvider.propTypes = {
  children: PropTypes.node,
};

const createJSSStyleSheet = (styleSheet) => {
  // Convert our stylesheet syntax to JSS's nested syntax.
  const jssStyleSheet = {};
  const classNameToJSSClassNames = {};

  Object.keys(styleSheet).forEach(className => {
    const jssClassNames = [];
    let currentClasNameId = 0;
    let currentJSSClassName = `${className}-${currentClasNameId}`;
    jssClassNames.push(currentJSSClassName);
    jssStyleSheet[currentJSSClassName] = {};

    const properties = styleSheet[className];
    Object.keys(properties).forEach(propertyName => {
      if (propertyName === '@switch') {
        // TODO
      } else if (propertyName.startsWith('@media')) {
        // Make a new JSS class wrapped in the media query.
        currentClasNameId += 1;
        currentJSSClassName = `${className}-${currentClasNameId}`;
        jssClassNames.push(currentJSSClassName);
        const mediaBlock = properties[propertyName];
        jssStyleSheet[propertyName] = {};
        jssStyleSheet[propertyName][currentJSSClassName] = addAmpersands(mediaBlock);
        currentClasNameId += 1;
        currentJSSClassName = `${className}-${currentClasNameId}`;
        // TODO: Don't add class names that don't have any styles yet.
        jssClassNames.push(currentJSSClassName);
      } else if (propertyName.startsWith(':')) {
        // Add a & at the beginning of the pseudo-selector.
        const pseudoSelectorBlock = properties[propertyName];
        jssStyleSheet[currentJSSClassName][`&${propertyName}`] = pseudoSelectorBlock;
      } else if (isCSSPropertyName(propertyName)) {
        // Add the value as is.
        const propertyValue = properties[propertyName];
        jssStyleSheet[currentJSSClassName][propertyName] = propertyValue;
      } else {
        // TODO: Add something like a stack trace.
        throw new Error(`Unrecognized property name '${propertyName}'`);
      }
    });

    console.log(`${className}:`, jssClassNames);

    classNameToJSSClassNames[className] = jssClassNames;
  });

  console.log(jssStyleSheet);

  return { jssStyleSheet, classNameToJSSClassNames };
};

const isCSSPropertyName = (propertyName) => /^[a-zA-Z-]/.test(propertyName[0]);

const addAmpersands = (block) => {
  const result = {};

  Object.keys(block).forEach(propertyName => {
    if (propertyName.startsWith(':')) {
      // Add a & at the beginning of the pseudo-selector.
      const pseudoSelectorBlock = block[propertyName];
      result[`&${propertyName}`] = pseudoSelectorBlock;
    } else if (isCSSPropertyName(propertyName)) {
      // Add the value as is.
      const propertyValue = block[propertyName];
      result[propertyName] = propertyValue;
    } else {
      // TODO: Add something like a stack trace.
      throw new Error(`Unrecognized property name '${propertyName}'`);
    }
  });

  return result;
};
