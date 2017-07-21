import { cssifyObject } from 'css-in-js-utils';
import invariant from 'invariant';

// Remove unnused rules in batches.
const REMOVE_UNUSED_RULES_BATCH_SIZE = 100;

const createSheet = () => {
  // TODO: Add data attribute.
  // TODO: Remove any existing server-rendered sheets.
  const styleTag = document.createElement('style');
  document.head.appendChild(styleTag);
  const sheet = styleTag.sheet;

  let idIndex = 0;
  const getUniqueClassName = () => {
    const id = idIndex;
    idIndex += 1;
    return `class-${id}`;
  };

  const allRules = [];
  let numUnusedRules = 0;

  const removeAllUnusedRules = () => {
    for (let i = 0; i < allRules.length; i++) {
      const rule = allRules[i];

      if (rule.isUnused) {
        allRules.splice(i, 1);
        sheet.deleteRule(i);
        i -= 1;
      } else {
        rule.index = i;
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      invariant(allRules.every((rule, index) => rule.index === index), 'Indexes are valid');
    }
  };

  const appendRule = (ruleDescription) => {
    const index = sheet.insertRule(getRuleCSS(ruleDescription), sheet.cssRules.length);
    const cssRule = sheet.cssRules[index];
    const rule = {
      index,
      cssRule,
      ruleDescription,
      isUnused: false,
    };

    allRules.push(rule);

    invariant(sheet.cssRules.length === allRules.length, 'Internal # of rules matches actual # of rules');

    return rule;
  };

  const removeRule = (rule) => {
    if (rule.ruleDescription.ruleType === 'style') {
      rule.cssRule.style.cssText = '';
    } else if (rule.ruleDescription.ruleType === 'media') {
      for (let i = 0; i < rule.cssRules.length; i++) {
        rule.deleteRule(rule.cssRules.length - 1);
      }
    } else {
      // TODO: Use fallback on production
      throw new Error('Unsupported rule type');
    }

    // Mark rule for removal.
    rule.isUnused = true;

    numUnusedRules += 1;

    if (numUnusedRules >= REMOVE_UNUSED_RULES_BATCH_SIZE) {
      removeAllUnusedRules();
      numUnusedRules = 0;
    }

    invariant(sheet.cssRules.length === allRules.length, 'Internal # of rules matches actual # of rules');
  };

  const replaceRule = (rule, ruleDescription) => {
    sheet.deleteRule(rule.index);
    // TODO: Wrap insertRule calls with try/catch?
    sheet.insertRule(getRuleCSS(ruleDescription), rule.index);
    rule.cssRule = sheet.cssRules[rule.index];
    rule.ruleDescription = ruleDescription;
    rule.isUnused = false;
  };

  const replaceRuleBlock = (rule, ruleDescription) => {
    // TODO: Use shallow equality to check if rule needs to be updated.
    if (rule.ruleDescription.ruleType === 'style') {
      rule.cssRule.style.cssText = getRuleBlockCSS(ruleDescription);
      rule.ruleDescription = ruleDescription;
    } else if (rule.ruleDescription.ruleType === 'media') {
      const subDescriptions = ruleDescription.ruleBlock;
      const numSubRules = rule.cssRule.cssRules.length;
      const maxLength = Math.max(subDescriptions.length, numSubRules);

      for (let i = 0; i < maxLength; i++) {
        if (i >= numSubRules) {
          const subDescription = subDescriptions[i];
          rule.cssRule.insertRule(getRuleCSS(subDescription), i);
        } else if (i >= subDescriptions.length) {
          rule.cssRule.deleteRule(i);
        } else {
          const subRule = rule.cssRule.cssRules[i];
          const subDescription = subDescriptions[i];

          // TODO: Be consistent about equality checking on CSSOM objects vs internal objects.
          if (subRule.selectorText === subDescription.ruleKey) {
            // Replace rule block
            subRule.style.cssText = getRuleBlockCSS(subDescription);
          } else {
            // Replace entire rule
            // TODO: Check if all browsers support changing selector dynamically.
            rule.cssRule.deleteRule(i);
            rule.cssRule.insertRule(getRuleCSS(subDescription), i);
          }
        }
      }

      rule.ruleDescription = ruleDescription;
    } else {
      throw new Error('Unsupported rule type');
    }
  };

  const getRuleDescription = (rule) => rule.ruleDescription;

  return {
    getUniqueClassName,
    appendRule,
    removeRule,
    replaceRule,
    replaceRuleBlock,
    getRuleDescription,
  };
};

const getRuleCSS = (ruleDescription) => {
  const { ruleType, ruleKey } = ruleDescription;

  if (ruleType === 'style') {
    return `.${ruleKey}{${getRuleBlockCSS(ruleDescription)}}`;
  } else {
    throw 'Unsupported rule type';
  }
};

const getRuleBlockCSS = (ruleDescription) => {
  const { ruleType, ruleBlock } = ruleDescription;

  if (ruleType === 'style') {
    return cssifyObject(ruleBlock);
  } else {
    throw 'Unsupported rule type';
  }
};

export default createSheet;






const makeGetUniqueClassName = () => {
  let idIndex = 0;
  const getUniqueClassName = () => {
    const id = idIndex;
    idIndex += 1;
    return `class-${id}`;
  };

  return getUniqueClassName;
};

const createNativeSheet = () => {
  // TODO: Add data attribute.
  // TODO: Remove any existing server-rendered sheets.
  const styleTag = document.createElement('style');
  document.head.appendChild(styleTag);
  return styleTag.sheet;
};

const createSheet2 = () => {
  const getUniqueClassName = makeGetUniqueClassName();
  const nativeSheet = createNativeSheet();

  const setRule = (ruleList, rule, nextRuleDescription) => {
    const { ruleType, ruleKey } = rule.ruleDescription;

    if (ruleType !== nextRuleDescription.ruleType || ruleKey !== nextRuleDescription.ruleKey) {
      replaceRule(ruleList, rule, nextRuleDescription);
    } else {
      if (ruleType === 'style') {
        rule.nativeRule.cssText = cssifyObject(nextRuleDescription.declarations);
      } else if (ruleType === 'media') {
        setRules(rule.ruleList, nextRuleDescription.subRules);
      }
    }
  };

  const setRules = (ruleList, ruleDescriptions) => {
    const maxLength = Math.max(ruleList.length, ruleDescriptions.length);

    // Add and update rules.
    for (let i = 0; i < maxLength; i++) {
      if (i >= ruleList.length) {
        // Create new rule instances if necessary.
        ruleList[i] = appendRule(ruleList, ruleDescriptions[i]);
      } else if (i >= ruleDescriptions.length) {
        // Remove unnecessary rule instances.
        ruleList.removeLastRule();
      } else {
        setRule(ruleList, ruleList[i], ruleDescriptions[i]);
      }
    }
  };

  const appendRule = (ruleList, ruleDescription) => {
    const nativeRule = ruleList.appendRuleCSS(getEmptyRuleCSS(ruleDescription));

    const rule = {
      index: ruleList.length - 1,
      nativeRule,
    };

    return rule;
  };

  const replaceRule = (ruleList, rule, nextRuleDescription) => {
    ruleList.replaceRuleCSSAt(rule.index, getEmptyRuleCSS(nextRuleDescription));
    setRule(ruleList, rule, nextRuleDescription);
  };

  const createStyleInstance = () => {
    const ruleList = createVirtualRuleList(nativeSheet);
    const className = getUniqueClassName();

    const setStyle = (styleDescription) => {
      const ruleDescriptions = convertStyleDescriptionToRuleDescriptions(className, styleDescription);

      setRules(ruleList, ruleDescriptions);

      if (process.env.NODE_ENV !== 'production') {
        invariant(
          ruleList.every((rule, index) => index === 0 || rule.index > ruleList[index - 1].index),
          'Source order of rules is preserved'
        );
      }

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

const getEmptyRuleCSS = (className, ruleDescription) => {
  const { ruleType, ruleKey } = ruleDescription;

  if (ruleType === 'style') {
    return `.${className}${ruleKey}{}`;
  } else if (ruleType === 'media') {
    return `@media ${ruleKey}{}`;
  } else {
    throw 'Unsupported rule type';
  }
};
