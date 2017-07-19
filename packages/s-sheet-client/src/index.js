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
      ruleType: ruleDescription.ruleType,
      ruleKey: ruleDescription.ruleKey,
      isUnused: false,
    };

    allRules.push(rule);

    invariant(sheet.cssRules.length === allRules.length, 'Internal # of rules matches actual # of rules');

    return rule;
  };

  const removeRule = (rule) => {
    if (rule.ruleType === 'style') {
      rule.cssRule.style.cssText = '';
    } else {
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
    rule.index = sheet.insertRule(getRuleCSS(ruleDescription), rule.index);
    rule.cssRule = sheet.cssRules[rule.index];
    rule.ruleType = ruleDescription.ruleType;
    rule.ruleKey = ruleDescription.ruleKey;
    rule.isUnused = false;
  };

  const replaceRuleBlock = (rule, ruleDescription) => {
    if (rule.ruleType === 'style') {
      rule.cssRule.style.cssText = getRuleBlockCSS(ruleDescription);
    } else {
      throw new Error('Unsupported rule type');
    }
  };

  const getRuleType = (rule) => rule.ruleType;
  const getRuleKey = (rule) => rule.ruleKey;

  return {
    getUniqueClassName,
    appendRule,
    removeRule,
    replaceRule,
    replaceRuleBlock,
    getRuleType,
    getRuleKey,
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
