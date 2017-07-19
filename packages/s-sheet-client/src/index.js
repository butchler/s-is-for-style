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
  const getUniqueId = () => {
    const id = idIndex;
    idIndex += 1;
    return `class-${id}`;
  };

  const allRules = [];
  let numUnusedRules = 0;

  const removedAllUnusedRules = () => {
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
  };

  return {
    insertStyleRuleAfter: (previousRule, pseudoSelector, declarations) => {
      invariant(sheet.cssRules.length === allRules.length, 'Internal # of rules matches actual # of rules');

      // TODO: Reuse unused rules.
      const className = getUniqueId();
      const selector = `.${className}${pseudoSelector}`;
      const cssText = cssifyObject(declarations);
      const ruleString = `${selector}{${cssText}}`;
      const beforeIndex = previousRule ? (previousRule.index + 1) : sheet.cssRules.length;
      const index = sheet.insertRule(ruleString, beforeIndex);

      const rule = {
        className,
        index,
        isUnused: false,
        pseudoSelector,
      };

      allRules.splice(index, 0, rule);

      return rule;
    },
    setStyleRuleDeclarations: (rule, declarations) => {
      const cssText = cssifyObject(declarations);
      sheet.cssRules[rule.index].style.cssText = cssText;
    },
    removeRule: (rule) => {
      invariant(sheet.cssRules.length === allRules.length, 'Internal # of rules matches actual # of rules');

      // Mark rule for removal.
      rule.isUnused = true;

      numUnusedRules += 1;

      if (numUnusedRules >= REMOVE_UNUSED_RULES_BATCH_SIZE) {
        removedAllUnusedRules();
        numUnusedRules = 0;
      }

      invariant(sheet.cssRules.length === allRules.length, 'Internal # of rules matches actual # of rules');
    },
    getClassName: (rule) => {
      return rule.className;
    },
    getPseudoSelector: (rule) => {
      return rule.pseudoSelector;
    },
  };
};

export default createSheet;
