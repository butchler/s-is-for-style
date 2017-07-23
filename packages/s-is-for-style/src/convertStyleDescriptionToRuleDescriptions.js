const convertStyleDescriptionToRuleDescriptions = (className, styleDescription) => {
  if (!styleDescription) {
    return [];
  }

  const ruleDescriptions = [];
  let baseDeclarations = undefined;

  // NOTE: This assumes that object key iteration preserves order.
  const keys = Object.keys(styleDescription);
  const length = keys.length;

  const keyIsNotBaseStyle = (i) => (
    i >= length || keys[i].startsWith(':') || keys[i].startsWith('@')
  );

  for (let i = 0; i < length; i++) {
    const key = keys[i];

    if (key.startsWith(':')) {
      ruleDescriptions.push(createStyleRuleDescription(className, key, styleDescription[key]));
    } else if (key.startsWith('@media')) {
      ruleDescriptions.push(createMediaRuleDescription(className, key, styleDescription[key]));
    } else {
      // Build up base styles.
      if (!baseDeclarations) {
        baseDeclarations = {};
      }

      baseDeclarations[key] = styleDescription[key];

      if (keyIsNotBaseStyle(i + 1)) {
        ruleDescriptions.push(createStyleRuleDescription(className, '', baseDeclarations));
        baseDeclarations = undefined;
      }
    }
  }

  return ruleDescriptions;
};

const createStyleRuleDescription = (className, pseudoSelector, declarations) => ({
  ruleType: 'style',
  ruleKey: `.${className}${pseudoSelector}`,
  declarations,
});

const createMediaRuleDescription = (className, ruleKey, subRules) => ({
  ruleType: 'media',
  ruleKey,
  childRuleDescriptions: convertStyleDescriptionToRuleDescriptions(className, subRules),
});


export default convertStyleDescriptionToRuleDescriptions;
