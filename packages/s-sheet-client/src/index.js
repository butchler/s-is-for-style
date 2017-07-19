import { cssifyObject } from 'css-in-js-utils';

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

  //const ruleList = [];

  return {
    insertStyleRuleAfter: (previousRule, pseudoSelector, declarations) => {
      // TODO: Reuse unused rules.
      const className = getUniqueId();
      const selector = `.${className}${pseudoSelector}`;
      const cssText = cssifyObject(declarations);
      const ruleString = `${selector}{${cssText}}`;
      const beforeIndex = previousRule ? (previousRule.index + 1) : sheet.cssRules.length;
      const index = sheet.insertRule(ruleString, beforeIndex);

      return {
        className,
        index,
        removed: false,
        pseudoSelector,
      };
    },
    setStyleRuleDeclarations: (rule, declarations) => {
      const cssText = cssifyObject(declarations);
      sheet.cssRules[rule.index].style.cssText = cssText;
    },
    removeRule: (rule) => {
      // Mark rule for removal.
      rule.removed = true;
      // TODO: Remove rules in batches.
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
