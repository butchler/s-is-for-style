import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { create } from 'jss';
import presets from 'jss-preset-default';

const jss = create(presets());

export function withClasses(styleSheet/*, TODO: options */) {
  const { jssStyleSheet, classes } = createJssStyleSheet(styleSheet);

  // TODO: Make proper JSS provider.
  const sheet = jss.createStyleSheet(jssStyleSheet).attach();

  const jssClasses = {};

  // TODO: Support dynamic style values.
  objectForEach(classes, (className, variants) => {
    const jssClassName = sheet.classes[className];

    if (!variants) {
      jssClasses[className] = jssClassName;
    } else {
      const jssVariants = {};

      objectForEach(variants, (variantName, variantClassName) => {
        const variantJssClassName = sheet.classes[variantClassName];
        jssVariants[variantName] = (
          variantJssClassName ?
            `${jssClassName} ${variantJssClassName}` :
            jssClassName
        );
      });

      jssClasses[className] = (variantName) => {
        const fullClassName = jssVariants[variantName];

        if (!fullClassName) {
          console.warn(`Invalid variant ${variantName}`);
        }

        return fullClassName;
      };
    }
  });

  return (WrappedComponent) => {
    // TODO: Add sheet when component is mounted using SheetManager.
    function WithClasses(props) {
      return <WrappedComponent classes={jssClasses} {...props} />;
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

const STATE_TOP_LEVEL = 'top-level';
const STATE_VARIANT = 'variant';
const STATE_MEDIA_QUERY = 'media-query';
const STATE_PSEUDO_SELECTOR = 'pseudo-selector';

const addClassToJssStyleSheet = ({
  jssSheets,
  variantClassNames,
  className,
  block,
  outputBlock,
  state,
}) => {
  if (!outputBlock) {
    throw new Error('Internal error: No outputBlock');
  }

  let hadVariant = false;

  objectForEach(block, (key, value) => {
    if (hadVariant) {
      throw new Error('@variants must be the last block');
    }

    if (key === '@variants') {
      if (state !== STATE_TOP_LEVEL) {
        // TODO: Show backtrace.
        throw new Error('@variants blocks are only allowed at the top level of a class block');
      }

      hadVariant = true;

      // TODO: Throw if there is only one variant.

      const variantBlocks = value;
      objectForEach(variantBlocks, (variantName, variantBlock) => {
        const variantClassName = `${className}-${variantName}`;

        variantClassNames[variantName] = variantClassName;

        // Don't add CSS for empty variants.
        if (variantBlock) {
          jssSheets.variants[variantClassName] = {};

          addClassToJssStyleSheet({
            jssSheets,
            variantClassNames,
            className: variantClassName,
            block: variantBlock,
            outputBlock: jssSheets.variants[variantClassName],
            state: STATE_VARIANT,
          });
        }
      });
    } else if (/^:[:a-zA-Z]/.test(key)) {
      if (!(state === STATE_TOP_LEVEL || state === STATE_VARIANT || state === STATE_MEDIA_QUERY)) {
        throw new Error('Pseudo-selector blocks cannot be nested');
      }

      // Pseudo-selector rule
      const pseudoSelector = key;

      // Add a & at the beginning of the pseudo-selector.
      outputBlock[`&${pseudoSelector}`] = {};

      addClassToJssStyleSheet({
        jssSheets,
        variantClassNames,
        className,
        block: value,
        outputBlock: outputBlock[`&${pseudoSelector}`],
        state: STATE_PSEUDO_SELECTOR,
      });
    } else if (/^@media/.test(key)) {
      if (!(state === STATE_TOP_LEVEL || state === STATE_VARIANT)) {
        throw new Error('@media queries only allowed at top level or in variants');
      }

      const mediaQuery = key;

      const mediaQuerySheet = (
        state === STATE_VARIANT ?
          jssSheets.variantMediaQueries :
          jssSheets.mediaQueries
      );

      if (!mediaQuerySheet[mediaQuery]) {
        mediaQuerySheet[mediaQuery] = {};
      }

      mediaQuerySheet[mediaQuery][className] = {};

      addClassToJssStyleSheet({
        jssSheets,
        variantClassNames,
        className,
        block: value,
        outputBlock: mediaQuerySheet[mediaQuery][className],
        state: STATE_MEDIA_QUERY,
      });
    } else if (/^[a-zA-Z-]/.test(key)) {
      // CSS property declaration
      const propertyName = key;

      // TODO: Maybe verify value?
      outputBlock[propertyName] = value;
    } else {
      throw new Error(`Invalid key '${key}'`);
    }
  });
};

const createJssStyleSheet = (styleSheet) => {
  // Convert our stylesheet syntax to JSS's nested syntax.
  const jssSheets = {
    classes: {},
    mediaQueries: {},
    variants: {},
    variantMediaQueries: {},
  };

  const classes = {};

  objectForEach(styleSheet, (className, block) => {
    const variantClassNames = {};

    jssSheets.classes[className] = {};

    addClassToJssStyleSheet({
      jssSheets,
      variantClassNames,
      className,
      block,
      outputBlock: jssSheets.classes[className],
      state: STATE_TOP_LEVEL,
    });

    classes[className] = (
      Object.keys(variantClassNames).length > 0 ?
        variantClassNames :
        undefined
    );
  });

  const jssStyleSheet = {
    ...jssSheets.classes,
    ...jssSheets.mediaQueries,
    ...jssSheets.variants,
    ...jssSheets.variantMediaQueries,
  };

  console.log({ jssStyleSheet, jssSheets, classes });

  return { jssStyleSheet, classes };
};

const objectForEach = (object, callback) => {
  if (!object || Object.keys(object).length === 0) {
    // TODO: Show backtrace.
    throw new Error('Empty blocks not allowed');
  }

  Object.keys(object).forEach((key, index) => {
    callback(key, object[key], index);
  });
};
