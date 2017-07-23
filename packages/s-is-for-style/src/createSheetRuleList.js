import invariant from 'invariant';

const STYLE_RULE = 1;
const MEDIA_RULE = 4;

const RULE_CLEANUP_MINIMUM_RULES = 10;
const RULE_CLEANUP_MAXIMIUM_RULES = 1000;

const createSheetRuleList = (nativeSheet) => {
  const ruleList = [];
  let numUnusedRules = 0;

  ruleList.appendRuleCSS = (ruleCSS) => {
    const index = nativeSheet.cssRules.length;

    // TODO: Wrap all insertRule calls with try/catch.
    nativeSheet.insertRule(ruleCSS, index);
    const nativeRule = nativeSheet.cssRules[index];

    const rule = {
      index,
      nativeRule,
      isUnused: false,
    };

    ruleList.push(rule);

    return rule;
  };

  ruleList.replaceRuleCSS = (rule, newRuleCSS) => {
    const { index } = rule;

    invariant(rule.nativeRule === nativeSheet.cssRules[index], 'Rule index is correct');

    nativeSheet.deleteRule(index);
    nativeSheet.insertRule(newRuleCSS, index);
    rule.nativeRule = nativeSheet.cssRules[index];
    rule.isUnused = false;

    return rule;
  };

  ruleList.deleteRule = (rule) => {
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

  let unscheduleRuleCleanup;
  const scheduleRuleCleanup = () => {
    if (numUnusedRules > RULE_CLEANUP_MAXIMIUM_RULES) {
      if (unscheduleRuleCleanup) {
        unscheduleRuleCleanup();
        unscheduleRuleCleanup = undefined;
      }

      cleanupUnusedRules();
    } else if (!unscheduleRuleCleanup && numUnusedRules > RULE_CLEANUP_MINIMUM_RULES) {
      unscheduleRuleCleanup = requestIdleCallbackWithFallback(() => {
        unscheduleRuleCleanup = undefined;
        cleanupUnusedRules();
      });
    }
  };

  const cleanupUnusedRules = () => {
    let i = 0;
    while (i < ruleList.length) {
      const rule = ruleList[i];

      if (rule.isUnused) {
        ruleList.splice(i, 1);
        nativeSheet.deleteRule(i);
      } else {
        rule.index = i;
        i += 1;
      }
    }

    numUnusedRules = 0;

    if (process.env.NODE_ENV !== 'production') {
      invariant(ruleList.every((rule, index) => rule.index === index), 'Indexes are valid');
    }
  };

  return ruleList;
};

// Simple wrapper for requestIdleCallback that returns an unschedule function instead of an ID, and
// uses setTimeout if requestIdleCallback isn't available.
const REQUEST_IDLE_CALLBACK_FALLBACK_TIMEOUT = 60 * 1000;
const requestIdleCallbackWithFallback = (callback) => {
  if (window.requestIdleCallback && window.cancelIdleCallback) {
    const id = window.requestIdleCallback(callback);
    return () => window.cancelIdleCallback(id);
  } else {
    const id = setTimeout(callback, REQUEST_IDLE_CALLBACK_FALLBACK_TIMEOUT);
    return () => clearTimeout(id);
  }
};

export default createSheetRuleList;
