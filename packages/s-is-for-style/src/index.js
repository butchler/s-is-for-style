import { cssifyObject } from 'css-in-js-utils';
import convertStyleDescriptionToRuleDescriptions from './convertStyleDescriptionToRuleDescriptions';
import createSheetRuleList from './createSheetRuleList';
import createVirtualRuleList from './createVirtualRuleList';
import createMediaRuleRuleList from './createMediaRuleRuleList';

// TODO: Make a proper name generator.
const makeGetUniqueClassName = () => {
  let idIndex = 0;
  const getUniqueClassName = () => {
    const id = idIndex;
    idIndex += 1;
    return `class-${id}`;
  };

  return getUniqueClassName;
};

const injectStyleTag = () => {
  // TODO: Add data attribute.
  // TODO: Remove any existing server-rendered sheets.
  const styleTag = document.createElement('style');
  styleTag.setAttribute('type', 'text/css');
  document.head.appendChild(styleTag);
  return styleTag;
};

const getEmptyRuleCSS = (ruleDescription) => `${ruleDescription.ruleKey}{}`;

export const createClientSheet = () => {
  const getUniqueClassName = makeGetUniqueClassName();
  const nativeSheet = injectStyleTag().sheet;
  const sheetRuleList = createSheetRuleList(nativeSheet);

  const setRule = (ruleList, rule, nextRuleDescription) => {
    let { ruleType, ruleKey } = rule.ruleDescription;

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
        // If all properties are the same and in the same order, update values dynamically.
        for (let i = 0; i < nextProperties.length; i++) {
          const property = nextProperties[i];
          rule.nativeRule.style.setProperty(property, nextDeclarations[property]);
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
        const rule = ruleList.appendRuleCSS(getEmptyRuleCSS(ruleDescriptions[i]));
        rule.ruleDescription = {
          ruleType: ruleDescriptions[i].ruleType,
          ruleKey: ruleDescriptions[i].ruleKey,
        };

        setRule(ruleList, rule, ruleDescriptions[i]);
      }
    }
  };

  const createStyleInstance = () => {
    const ruleList = createVirtualRuleList(sheetRuleList);
    const className = getUniqueClassName();

    const setStyle = (styleDescription) => {
      const ruleDescriptions = convertStyleDescriptionToRuleDescriptions(className, styleDescription);

      setRules(ruleList, ruleDescriptions);

      //console.log(`Sheet text: ${[...nativeSheet.cssRules].map(rule => rule.cssText).join('\n')}`);

      return className;
    };

    return {
      setStyle,
    };
  };

  return {
    createStyleInstance,
  };
};
