import invariant from 'invariant';

const STYLE_RULE = 1;
const MEDIA_RULE = 4;

const createGlobalRuleList = (nativeSheet) => {
  const ruleList = [];

  ruleList.appendRuleCSS = (ruleCSS) => {
    const index = ruleList.length;
    const nativeIndex = nativeSheet.cssRules.length;

    // TODO: Wrap all insertRule calls with try/catch.
    nativeSheet.insertRule(ruleCSS, nativeIndex);
    const nativeRule = nativeSheet.cssRules[nativeIndex];

    const rule = {
      index,
      nativeIndex,
      nativeRule,
    };

    ruleList.push(rule);

    return rule;
  };

  ruleList.replaceRuleCSS = (rule, newRuleCSS) => {
    const { index, nativeIndex } = rule;

    invariant(rule.nativeRule === nativeSheet.cssRules[nativeIndex], 'Rule index is correct');

    nativeSheet.deleteRule(nativeIndex);
    nativeSheet.insertRule(newRuleCSS, nativeIndex);
    const nativeRule = nativeSheet.cssRules[nativeIndex];

    const newRule = {
      index,
      nativeIndex,
      nativeRule,
    };

    ruleList[index] = newRule;

    return newRule;
  };

  ruleList.deleteLastRule = () => {
    const lastRule = ruleList.pop();
    const { nativeIndex } = lastRule;

    // Clear contents of native rule.
    const nativeRule = nativeSheet.cssRules[nativeIndex];

    if (nativeRule.type === STYLE_RULE) {
      nativeRule.style.cssText = '';
    } else if (nativeRule.type === MEDIA_RULE) {
      // Remove all child rules.
      while (nativeRule.cssRules.length > 0) {
        nativeRule.deleteRule(nativeRule.cssRules.length);
      }
    } else {
      throw new Error('Unsupported rule type');
    }

    // TODO: Batched removal of rules.
  };

  return ruleList;
};

/*
// Remove unnused rules in batches.
const REMOVE_UNUSED_RULES_BATCH_SIZE = 100;
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
*/

export default createGlobalRuleList;
