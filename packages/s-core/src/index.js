const createInstance = (sheet) => {
  let rules = {};

  const getClassNames = () =>
    Object.keys(rules).map(key => rules[key].className).join(' ');

  const updateBaseRule = (declarations) => updateRule('base', '', true, declarations);
  const updatePseudoRule = (pseudoSelector, declarations) => updateRule(pseudoSelector, pseudoSelector, false, declarations);

  const updateRule = (ruleKey, pseudoSelector, skipPseudo, declarations) => {
    if (rules[ruleKey]) {
      // Remove unused declarations.
      const style = rules[ruleKey].rule.style;

      for (let i = 0; i < style.length; i++) {
        const propertyName = style[i];
        if (!hasOwnProperty(declarations, propertyName)) {
          rules[ruleKey].rule.style.removeProperty(propertyName);
        }
      }
    }

    // Update declarations.
    Object.keys(declarations).forEach(propertyName => {
      if (skipPseudo && propertyName.startsWith(':')) {
        // skip pseudo selectors when updating base rule.
        return;
      }

      const propertyValue = declarations[propertyName];
      if (propertyValue !== undefined) {
        if (!rules[ruleKey]) {
          // Create rule if we don't have one already.
          rules[ruleKey] = sheet.addStyleRule(pseudoSelector);
        }

        const style = rules[ruleKey].rule.style;
        if (propertyValue !== style.getPropertyValue(propertyName)) {
          style.setProperty(propertyName, propertyValue);
        }
      }
    });
  };

  const removeRule = (ruleKey) => {
    rules[ruleKey].remove();
    delete rules[ruleKey];
  };

  // TODO: Support keyframes and media queries.
  const setStyles = (styles) => {
    // Remove unnused pseudo selector rules.
    Object.keys(rules).forEach(ruleKey => {
      if (ruleKey.startsWith(':') && !hasOwnProperty(styles, ruleKey)) {
        removeRule(ruleKey);
      }
    });

    // Remove base rule if there are no properties.
    // TODO: Also remove base rule even if there pseudo selectors, etc.
    if (Object.keys(styles).length === 0) {
      if (hasOwnProperty(rules, 'base')) {
        removeRule('base');
      }
    }

    // Update pseudo selector rules.
    Object.keys(styles).forEach(key => {
      if (key.startsWith(':')) {
        const pseudoSelectorDeclarations = styles[key];
        updatePseudoRule(key, pseudoSelectorDeclarations);
      }
    });

    updateBaseRule(styles);

    return getClassNames();
  };

  return setStyles;
};

const _hasOwnProperty = ({}).hasOwnProperty;
const hasOwnProperty = (object, property) => _hasOwnProperty.call(object, property);

export default createInstance;
