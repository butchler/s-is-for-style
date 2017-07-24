import invariant from 'invariant';

const createMediaRuleRuleList = (nativeMediaRule) => {
  const ruleList = [];

  ruleList.appendRuleCSS = (ruleCSS) => {
    const index = nativeMediaRule.cssRules.length;

    invariant(ruleList.length === index, 'Number of rules is correct');

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
    const numRules = nativeMediaRule.cssRules.length;

    invariant(ruleList.length === numRules, 'Number of rules is correct');

    ruleList.pop();
    nativeMediaRule.deleteRule(numRules);
  };

  return ruleList;
};

export default createMediaRuleRuleList;
