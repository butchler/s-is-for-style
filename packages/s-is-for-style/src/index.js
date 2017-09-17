import { cssifyObject } from 'css-in-js-utils';
import convertStyleDescriptionToRuleDescriptions from './convertStyleDescriptionToRuleDescriptions';
import createSheetRuleList from './createSheetRuleList';
import createMediaRuleRuleList from './createMediaRuleRuleList';
import makeGetUniqueClassName from './makeGetUniqueClassName';
import injectStyleTag from './injectStyleTag';

export const createClientSheet = () => {
  const getUniqueClassName = makeGetUniqueClassName();
  const nativeSheet = injectStyleTag().sheet;
  const sheet = createSheetRuleList(nativeSheet);

  const atomicProperties = {};

  const setRule = (ruleList, rule, nextRuleDescription) => {
    let { ruleType, ruleKey } = rule.ruleDescription;

    // TODO: Update selector text directly for style rules if the browser supports it.
    if (ruleType !== nextRuleDescription.ruleType || ruleKey !== nextRuleDescription.ruleKey) {
      ruleList.replaceRuleCSS(rule, getEmptyRuleCSS(nextRuleDescription));
      ruleType = nextRuleDescription.ruleType;
      ruleKey = nextRuleDescription.ruleKey;
    }

    if (ruleType === 'style') {
      const currentDeclarations = rule.ruleDescription.declarations || {};
      const nextDeclarations = nextRuleDescription.declarations;
      const currentProperties = Object.keys(currentDeclarations);
      const nextProperties = Object.keys(nextDeclarations);

      if (
        currentProperties.length === nextProperties.length &&
        currentProperties.every((property, i) => property === nextProperties[i])
      ) {
        // TODO: Hyphenate property names!

        // If all properties are the same and in the same order, update values dynamically.
        // TODO: Compare performance of this vs. setting cssText.
        for (let i = 0; i < nextProperties.length; i++) {
          const property = nextProperties[i];
          if (currentDeclarations[property] !== nextDeclarations[property]) {
            rule.nativeRule.style.setProperty(property, nextDeclarations[property]);
          }
        }
      } else {
        // Otherwise, just overwrite CSS so we can preserve order.
        rule.nativeRule.style.cssText = cssifyObject(nextRuleDescription.declarations);
      }
    } else if (ruleType === 'media') {
      if (!rule.ruleList) {
        rule.ruleList = createMediaRuleRuleList(rule.nativeRule);
      }

      setRules(rule.ruleList, nextRuleDescription.childRuleDescriptions);
    }

    rule.ruleDescription = nextRuleDescription;
  };

  const setRules = (ruleList, ruleDescriptions) => {
    // Update existing rules
    const minLength = Math.min(ruleList.length, ruleDescriptions.length);
    for (let i = 0; i < minLength; i++) {
      setRule(ruleList, ruleList[i], ruleDescriptions[i]);
    }

    if (ruleList.length > ruleDescriptions.length) {
      // Remove unnecessary rules.
      for (let i = ruleDescriptions.length; i < ruleList.length; i++) {
        ruleList.deleteLastRule();
      }
    } else if (ruleDescriptions.length > ruleList.length) {
      // Add new rules.
      for (let i = ruleList.length; i < ruleDescriptions.length; i++) {
        const ruleDescription = ruleDescriptions[i];

        // TODO: Skip all empty rule descriptions.
        if (ruleDescription.ruleType === 'style' && Object.keys(ruleDescription.declarations).length === 0) {
          //console.log('Skipping:', ruleDescription);
          continue;
        }

        const rule = ruleList.appendRuleCSS(getEmptyRuleCSS(ruleDescription));
        rule.ruleDescription = {
          ruleType: ruleDescription.ruleType,
          ruleKey: ruleDescription.ruleKey,
        };

        setRule(ruleList, rule, ruleDescription);
      }
    }
  };

  const createStyleInstance = () => {
    const ruleList = sheet.createRuleList();
    const className = getUniqueClassName();

    const setStyle = (styleDescription) => {
      // TODO: Maybe use object pool for convertStyleDescriptionToRuleDescriptions?
      const ruleDescriptions = convertStyleDescriptionToRuleDescriptions(className, styleDescription);

      // TODO: Maybe hyphenate property names here?

      // TODO: Use shared atomic classes if possible: only for base styles, and only if the base
      // styles include only shorthand or only non-shorthand versions of a property.
      //
      // For example:
      //
      // `{ border: '1px solid black' }` can use shared atomic border class
      // `{ borderTop: '3px solid red' }` can use shared atomic borderTop class
      // `{ borderTop: '1 px solid black', borderBottom: '3px solid gray' }` can use shared atomic
      // borderTop and borderBottom classes
      //
      // and:
      //
      // `{ border: '1px solid black', borderTop: '3px solid red' }` cannot use atomic class
      // `{ borderTop: '1 px solid black', borderTopWidth: '3px' }` cannot use atomic classes
      // `{ borderTop: '1 px solid black', borderWidth: '3px' }` cannot use atomic classes
      // `{ border: '1 px solid black', borderWidth: '3px' }` cannot use atomic classes
      //
      // False positives (using a shared class when not allowed) can lead to nondeterministic
      // behavior, but false negatives (not using a shared class when one could have been used) are
      // okay, they just might lead to slightly worse performance.

      let atomicClassNames = '';

      /*
      ruleDescriptions.forEach(rule => {
        if (rule.ruleType === 'style' && rule.ruleKey.indexOf(':') === -1) {
          Object.keys(rule.declarations).forEach(propertyName => {
            // TODO: Skip all properties that have shorthands.
            if (propertyName === 'border' || propertyName === 'border-top') {
              return;
            }

            const propertyValue = rule.declarations[propertyName];
            const atomicKey = `${propertyName}:${propertyValue}`;

            //if (atomicProperties.hasOwnProperty(atomicKey)) {
              //console.log('Reusing:', atomicProperties[atomicKey], atomicKey);
            //}

            if (!atomicProperties.hasOwnProperty(atomicKey)) {
              // Add to atomicProperties registry.
              const newAtomicClassName = getUniqueClassName();
              //console.log('Adding:', newAtomicClassName, atomicKey);
              const atomicRuleList = sheet.createRuleList();
              const atomicDeclaration = {
                ruleType: 'style',
                ruleKey: `.${newAtomicClassName}`,
                declarations: {
                  [propertyName]: propertyValue,
                },
              };

              // Actually insert the atomic CSS.
              setRules(atomicRuleList, [atomicDeclaration]);

              // Remember the atomic CSS's classname.
              atomicProperties[atomicKey] = newAtomicClassName;
            }

            atomicClassNames += ` ${atomicProperties[atomicKey]}`;

            // We're using an atomic CSS classname, so remove the declaration.
            delete rule.declarations[propertyName];
          });
        }
      });
      */

      setRules(ruleList, ruleDescriptions);

      //console.log(`Sheet text: ${[...nativeSheet.cssRules].map(rule => rule.cssText).join('\n')}`);

      return atomicClassNames !== '' ? className + atomicClassNames : className;
    };

    return {
      setStyle,
    };
  };

  return {
    createStyleInstance,
  };
};

// Maps property names to the names of other properties that they overlap with. Properties that
// "overlap" are properties that can set some of the same values (e.g. `border`, `border-top`, and
// `border-top-width` can all set the top border's width).
const getBorderShorthandProps = (side) => {
  const prefix = side === undefined ? '' : `${side}-`;

  return [`border-${prefix}width`, `border-${prefix}style`, `border-${prefix}color`];
};

const PROPERTY_OVERLAP_TABLE = {
  'border-top': ['border', ...getBorderShorthandProps(), ...getBorderShorthandProps('top')],
  'border-bottom': ['border', ...getBorderShorthandProps(), ...getBorderShorthandProps('bottom')],
  'border-left': ['border', ...getBorderShorthandProps(), ...getBorderShorthandProps('left')],
  'border-right': ['border', ...getBorderShorthandProps(), ...getBorderShorthandProps('right')],
  border: [
    ...getBorderShorthandProps(),
    ...getBorderShorthandProps('top'),
    ...getBorderShorthandProps('bottom'),
    ...getBorderShorthandProps('left'),
    ...getBorderShorthandProps('right'),
  ],
};

const getEmptyRuleCSS = (ruleDescription) => `${ruleDescription.ruleKey}{}`;
