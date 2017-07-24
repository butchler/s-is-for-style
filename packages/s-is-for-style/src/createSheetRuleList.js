import invariant from 'invariant';
import { requestIdleCallback, cancelIdleCallback } from './requestIdleCallback';

const STYLE_RULE = 1;
const MEDIA_RULE = 4;

const RULE_CLEANUP_MINIMUM_RULES = 10;
const RULE_CLEANUP_MAXIMIUM_RULES = 1000;

const createSheet = (nativeSheet) => {
  const sheetRuleList = [];
  let numUnusedRules = 0;

  sheetRuleList.appendRuleCSS = (ruleCSS) => {
    const index = nativeSheet.cssRules.length;

    // TODO: Wrap all insertRule calls with try/catch.
    nativeSheet.insertRule(ruleCSS, index);
    const nativeRule = nativeSheet.cssRules[index];

    const rule = {
      index,
      nativeRule,
      isUnused: false,
    };

    sheetRuleList.push(rule);

    return rule;
  };

  sheetRuleList.replaceRuleCSS = (rule, newRuleCSS) => {
    const { index } = rule;

    invariant(rule.nativeRule === nativeSheet.cssRules[index], 'Rule index is correct');

    nativeSheet.deleteRule(index);
    nativeSheet.insertRule(newRuleCSS, index);
    rule.nativeRule = nativeSheet.cssRules[index];
    rule.isUnused = false;

    return rule;
  };

  sheetRuleList.deleteRule = (rule) => {
    const { index } = rule;

    // Clear contents of native rule.
    const nativeRule = nativeSheet.cssRules[index];

    if (nativeRule.type === STYLE_RULE) {
      nativeRule.style.cssText = '';
    } else if (nativeRule.type === MEDIA_RULE) {
      // Remove all child rules.
      while (nativeRule.cssRules.length > 0) {
        nativeRule.deleteRule(nativeRule.cssRules.length - 1);
      }
    } else {
      throw new Error('Unsupported rule type');
    }

    rule.isUnused = true;
    numUnusedRules += 1;

    scheduleRuleCleanup();
  };

  let callbackId;
  const scheduleRuleCleanup = () => {
    if (numUnusedRules > RULE_CLEANUP_MAXIMIUM_RULES) {
      if (callbackId) {
        cancelIdleCallback(callbackId);
        callbackId = undefined;
      }

      cleanupUnusedRules();
    } else if (!callbackId && numUnusedRules > RULE_CLEANUP_MINIMUM_RULES) {
      callbackId = requestIdleCallback(() => {
        callbackId = undefined;
        cleanupUnusedRules();
      });
    }
  };

  const cleanupUnusedRules = () => {
    let i = 0;
    while (i < sheetRuleList.length) {
      const rule = sheetRuleList[i];

      if (rule.isUnused) {
        sheetRuleList.splice(i, 1);
        nativeSheet.deleteRule(i);
      } else {
        rule.index = i;
        i += 1;
      }
    }

    numUnusedRules = 0;

    if (process.env.NODE_ENV !== 'production') {
      invariant(sheetRuleList.every((rule, index) => rule.index === index), 'Indexes are valid');
    }
  };

  return {
    createRuleList: () => createVirtualRuleList(sheetRuleList),
  };;
};

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

export default createSheet;
