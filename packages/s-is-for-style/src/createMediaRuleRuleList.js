import invariant from 'invariant';

const createMediaRuleRuleList = (nativeMediaRule) => {
  const ruleList = [];

  ruleList.appendRuleCSS = (ruleCSS) => {
    const index = nativeMediaRule.cssRules.length;
    nativeMediaRule.insertRule(ruleCSS, index);
    const nativeRule = nativeMediaRule.cssRules[index];

    const rule = {
      index,
      nativeRule,
    };

    ruleList.push(rule);

    return rule;
  };

  ruleList.replaceRuleCSS = (rule, newRuleCSS) => {
    const index = rule.index;

    invariant(rule.nativeRule === nativeMediaRule.cssRules[index], 'Rule index is correct');

    nativeMediaRule.deleteRule(index);

    nativeMediaRule.insertRule(newRuleCSS, index);
    const nativeRule = nativeMediaRule.cssRules[index];

    const newRule = {
      index,
      nativeRule,
    };

    ruleList[index] = newRule;

    return newRule;
  };

  ruleList.deleteLastRule = () => {
    ruleList.pop();
    nativeMediaRule.deleteRule(nativeMediaRule.cssRules.length);
  };

  return ruleList;
};

export default createMediaRuleRuleList;
