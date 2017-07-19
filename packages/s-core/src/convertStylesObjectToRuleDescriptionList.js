const convertStyleDescriptionToRuleDescriptions = (
  className,
  styleDescription,
  isTopLevel = true
) => {
  const ruleDescriptions = [];
  let baseDeclarations = undefined;

  // NOTE: This assumes that object key iteration preserves order.
  const keys = Object.keys(styleDescription);
  const length = keys.length;

  const keyIsNotBaseStyle = (i) => (
    i >= length || keys[i].startsWith(':') || keys[i].startsWith('@')
  );

  const addStyleRuleDescription = (pseudoSelector, declarations) => {
    ruleDescriptions.push({
      ruleType: 'style',
      ruleKey: `${className}${pseudoSelector}`,
      ruleBlock: declarations,
    });
  };

  const addMediaRuleDescription = (mediaCondition, subRules) => {
    ruleDescriptions.push({
      ruleType: 'media',
      ruleKey: mediaCondition,
      ruleBlock: convertStyleDescriptionToRuleDescriptions(className, subRules, false),
    });
  };

  for (let i = 0; i < length; i++) {
    const key = keys[i];

    if (key.startsWith(':')) {
      addStyleRuleDescription(key, styleDescription[key]);
    } else if (key.startsWith('@media')) {
      // Only allow @ rules at the top level.
      if (isTopLevel) {
        addMediaRuleDescription(key, styleDescription[key]);
      }
    } else {
      // Build up base styles.
      if (!baseDeclarations) {
        baseDeclarations = {};
      }

      baseDeclarations[key] = styleDescription[key];

      if (keyIsNotBaseStyle(i + 1)) {
        addStyleRuleDescription('', baseDeclarations);
        baseDeclarations = undefined;
      }
    }
  }

  return ruleDescriptions;
};

export default convertStyleDescriptionToRuleDescriptions;
