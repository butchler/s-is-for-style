const createVirtualRuleList = (sheetRuleList) => {
  const ruleList = [];

  ruleList.appendRuleCSS = (ruleCSS) => {
    const rule = sheetRuleList.appendRuleCSS(ruleCSS);
    ruleList.push(rule);
    return rule;
  };

  ruleList.replaceRuleCSS = sheetRuleList.replaceRuleCSS;

  ruleList.deleteLastRule = () => {
    const rule = ruleList.pop();
    sheetRuleList.deleteRule(rule);
  };

  return ruleList;
};

export default createVirtualRuleList;
