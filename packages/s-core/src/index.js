import convertStyleDescriptionToRuleDescriptions from './convertStylesObjectToRuleDescriptionList';

const createStyleInstance = (sheet) => {
  const ruleInstances = [];
  const className = sheet.getUniqueClassName();

  const setStyleState = (styleDescription) => {
    const ruleDescriptions = convertStyleDescriptionToRuleDescriptions(className, styleDescription);
    const maxLength = Math.max(ruleDescriptions.length, ruleInstances.length);

    // Add and update rules.
    for (let i = 0; i < maxLength; i++) {
      // Create new rule instances if necessary.
      if (i >= ruleInstances.length) {
        ruleInstances[i] = createRuleInstance(sheet);
      }

      // Reset the state of unneeded rule instances.
      const setRuleState = ruleInstances[i];
      const ruleDescription = i < ruleDescriptions.length ? ruleDescriptions[i] : null;
      setRuleState(ruleDescription);
    }

    ruleInstances.length = ruleDescriptions.length;

    return className;
  };

  return setStyleState;
};

const createRuleInstance = (sheet) => {
  let rule;

  const setRuleState = (nextRuleDescription) => {
    if (rule && !nextRuleDescription) {
      sheet.removeRule(rule);
      rule = undefined;
    } else if (!rule && nextRuleDescription) {
      rule = sheet.appendRule(nextRuleDescription);
    } else if (rule) {
      // TODO: Check if changing rule key is supported.
      if (
        nextRuleDescription.ruleType !== sheet.getRuleType(rule) ||
        nextRuleDescription.ruleKey !== sheet.getRuleKey(rule)
      ) {
        sheet.replaceRule(rule, nextRuleDescription);
      } else {
        // Update rule block
        sheet.replaceRuleBlock(rule, nextRuleDescription);
      }
    }
  };

  return setRuleState;
};

export default createStyleInstance;
