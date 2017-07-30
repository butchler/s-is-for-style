const convertStyleDescriptionToRuleDescriptions = (className, styleDescription) => {
  if (!styleDescription) {
    return [];
  }

  let baseDeclarations = undefined;
  let pseudoSelectorRules = undefined;
  let mediaRules = undefined;
  let hadMediaRule = false;

  // NOTE: This assumes that object key iteration preserves order.
  const keys = Object.keys(styleDescription);
  const length = keys.length;

  for (let i = 0; i < length; i++) {
    const key = keys[i];

    if (hadMediaRule && !key.startsWith('@media')) {
      // TODO: Only print warning once.
      console.warn('@media rules take precedence over other rules and should come after all other rules.');
    }

    if (key.startsWith(':')) {
      if (!pseudoSelectorRules) {
        pseudoSelectorRules = [];
      }

      pseudoSelectorRules.push(createStyleRuleDescription(className, key, styleDescription[key]));
    } else if (key.startsWith('@media')) {
      hadMediaRule = true;

      if (!mediaRules) {
        mediaRules = [];
      }

      mediaRules.push(createMediaRuleDescription(className, key, styleDescription[key]));
    } else {
      // Build up base styles.
      if (!baseDeclarations) {
        baseDeclarations = {};
      }

      baseDeclarations[key] = styleDescription[key];
    }
  }

  const allRuleDescriptions = [];

  if (baseDeclarations) {
    allRuleDescriptions.push(createStyleRuleDescription(className, '', baseDeclarations));
  }

  if (pseudoSelectorRules) {
    for (let i = 0; i < pseudoSelectorRules.length; i++) {
      allRuleDescriptions.push(pseudoSelectorRules[i]);
    }
  }

  if (mediaRules) {
    for (let i = 0; i < mediaRules.length; i++) {
      allRuleDescriptions.push(mediaRules[i]);
    }
  }

  return allRuleDescriptions;
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
