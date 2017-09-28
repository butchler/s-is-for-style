import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { create } from 'jss';
import presets from 'jss-preset-default';

const jss = create(presets());

export function withClasses(styleSheet/*, TODO: options */) {
  const { jssStyleSheet, getJssClassNameArray } = createJssStyleSheet(styleSheet);

  // TODO: Make proper JSS provider.
  const sheet = jss.createStyleSheet(jssStyleSheet).attach();

  const classes = {};

  // TODO: Support dynamic style values.
  Object.keys(styleSheet).forEach(className => {
    // TODO: Optimize?
    classes[className] = (data) => getJssClassNameArray[className](data)
      .map(jssClassName => sheet.classes[jssClassName])
      .join(' ');
  });

  return (WrappedComponent) => {
    // TODO: Add sheet when component is mounted using SheetManager.
    function WithClasses(props) {
      return <WrappedComponent classes={classes} {...props} />;
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
const STATE_SWITCH_CASE = 'switch-case';
const STATE_MEDIA_QUERY = 'media-query';
const STATE_PSEUDO_SELECTOR = 'pseudo-selector';

const addClassToJssStyleSheet = ({
  jssSheetClasses,
  jssSheetMediaQueries,
  switchMappings,
  className,
  block,
  outputBlock,
  state,
}) => {
  if (!outputBlock) {
    throw new Error('Internal error: No outputBlock');
  } else if (state === STATE_SWITCH_CASE && !block || Object.keys(block).length === 0) {
    // Allow empty blocks inside switch cases.
    return;
  }

  let hadSwitch = false;

  objectForEach(block, (key, value) => {
    if (hadSwitch) {
      throw new Error('@switch must be the last block');
    }

    if (key === '@switch') {
      if (state !== STATE_TOP_LEVEL) {
        // TODO: Show backtrace.
        throw new Error('@switch blocks are only allowed at the top level of a class block');
      }

      hadSwitch = true;

      const switchBlocks = value;
      objectForEach(switchBlocks, (switchValueName, cases) => {
        switchMappings[switchValueName] = {};

        // TODO: Verify cases.
        objectForEach(cases, (caseValue, caseStyleBlock, index) => {
          // TODO: Add caseValue to caseClassName?
          const caseClassName = `${className}-${switchValueName}-${index}`;
          jssSheetClasses[caseClassName] = {};
          switchMappings[switchValueName][caseValue] = caseClassName;

          addClassToJssStyleSheet({
            jssSheetClasses,
            jssSheetMediaQueries,
            switchMappings,
            className: caseClassName,
            block: caseStyleBlock,
            outputBlock: jssSheetClasses[caseClassName],
            state: STATE_SWITCH_CASE,
          });
        });
      });
    } else if (/^:[:a-zA-Z]/.test(key)) {
      if (!(state === STATE_TOP_LEVEL || state === STATE_SWITCH_CASE || state === STATE_MEDIA_QUERY)) {
        throw new Error('Pseudo-selector blocks cannot be nested');
      }

      // Pseudo-selector rule
      const pseudoSelector = key;

      // Add a & at the beginning of the pseudo-selector.
      outputBlock[`&${pseudoSelector}`] = {};

      addClassToJssStyleSheet({
        jssSheetClasses,
        jssSheetMediaQueries,
        switchMappings,
        className,
        block: value,
        outputBlock: outputBlock[`&${pseudoSelector}`],
        state: STATE_PSEUDO_SELECTOR,
      });
    } else if (/^@media/.test(key)) {
      if (!(state === STATE_TOP_LEVEL || state === STATE_SWITCH_CASE)) {
        throw new Error('@media queries only allowed at top level or in switch cases');
      }

      const mediaQuery = key;

      if (!jssSheetMediaQueries[mediaQuery]) {
        jssSheetMediaQueries[mediaQuery] = {};
      }

      jssSheetMediaQueries[mediaQuery][className] = {};

      addClassToJssStyleSheet({
        jssSheetClasses,
        jssSheetMediaQueries,
        switchMappings,
        className,
        block: value,
        outputBlock: jssSheetMediaQueries[mediaQuery][className],
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
  const jssSheetClasses = {};
  const jssSheetMediaQueries = {};
  const getJssClassNameArray = {};

  objectForEach(styleSheet, (className, block) => {
    const switchMappings = {};

    jssSheetClasses[className] = {};

    addClassToJssStyleSheet({
      jssSheetClasses,
      jssSheetMediaQueries,
      switchMappings,
      className,
      block,
      outputBlock: jssSheetClasses[className],
      state: STATE_TOP_LEVEL,
    });

    // TODO: Support dynamic style values.
    getJssClassNameArray[className] = (data) => {
      if (!data) {
        return [className];
      } else {
        const result = [className];

        const addClassName = (caseClassName) => caseClassName && result.push(caseClassName);

        objectForEach(switchMappings, (dataKey, cases) => {
          if (data.hasOwnProperty(dataKey)) {
            const dataValue = data[dataKey];
            // TODO: Warn if dataValue is 'default'

            if (typeof dataValue === 'boolean') {
              addClassName(dataValue ? cases.true : cases.false);
            } else {
              addClassName(cases[dataValue] || cases.default || cases.false);
            }
          } else {
            // Data not provided, use default.
            // TODO: Warn if data is not provided?
            addClassName(cases.default || cases.false);
          }
        });

        return result;
      }
    };
  });

  const jssStyleSheet = {
    ...jssSheetClasses,
    ...jssSheetMediaQueries,
  };

  return { jssStyleSheet, getJssClassNameArray };
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
