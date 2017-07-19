import convertStylesObjectToRuleDescriptionList from './convertStylesObjectToRuleDescriptionList';

const createInstance = (sheet) => {
  const rules = [];

  const getClassNames = () =>
    rules.map(sheet.getClassName).join(' ');

  const setStyles = (nextStylesObject) => {
    const nextRuleDescriptions = convertStylesObjectToRuleDescriptionList(nextStylesObject);

    // Add and update rules.
    for (let i = 0; i < nextRuleDescriptions.length; i++) {
      const rule = rules[i];
      const nextRuleDescription = nextRuleDescriptions[i];

      // TODO: Support @media/@keyframes/@font-face rule types.
      if (!rule || sheet.getPseudoSelector(rule) !== nextRuleDescription.pseudoSelector) {
        if (rule) {
          sheet.removeRule(rule);
        }

        const previousRule = i === 0 ? undefined : rules[i - 1];
        rules[i] = sheet.insertStyleRuleAfter(
          previousRule,
          nextRuleDescription.pseudoSelector,
          nextRuleDescription.declarations
        );
      } else if (sheet.getPseudoSelector(rule) === nextRuleDescription.pseudoSelector) {
        sheet.setStyleRuleDeclarations(rules[i], nextRuleDescription.declarations);
      }
    }

    // Remove extra/unnused rules.
    for (let i = nextRuleDescriptions.length; i < rules.length; i++) {
      sheet.removeRule(rules[i]);
      delete rules[i];
    }

    return getClassNames();
  };

  return setStyles;
};

export default createInstance;
