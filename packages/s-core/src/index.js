const createInstance = (sheet) => {
  let rules = {};

  const getClassNames = () =>
    Object.keys(rules).map(key => rules[key].className).join(' ');

  const initBaseRule = (declarations) => initRule('base', '', true, declarations);
  const initPseudoRule = (pseudoSelector, declarations) => initRule(pseudoSelector, pseudoSelector, false, declarations);

  const initRule = (ruleKey, pseudoSelector, skipPseudo, declarations) => {
    Object.keys(declarations).forEach(propertyName => {
      if (skipPseudo && propertyName.startsWith(':')) {
        // skip pseudo selectors when adding base rule.
        return;
      } else {
        if (!rules[ruleKey]) {
          rules[ruleKey] = sheet.addStyleRule(pseudoSelector);
        }

        const propertyValue = declarations[propertyName];
        rules[ruleKey].rule.style.setProperty(propertyName, propertyValue);
      }
    });
  };

  const updateBaseRule = (declarations) => updateRule('base', '', true, declarations);
  const updatePseudoRule = (pseudoSelector, declarations) => updateRule(pseudoSelector, pseudoSelector, false, declarations);

  const updateRule = (ruleKey, pseudoSelector, skipPseudo, declarations) => {
    if (!rules[ruleKey]) {
      initRule(ruleKey, pseudoSelector, skipPseudo, declarations);
      return;
    }

    const style = rules[ruleKey].rule.style;

    // Remove unused declarations.
    for (let i = 0; i < style.length; i++) {
      const propertyName = style[i];
      if (!declarations.hasOwnProperty(propertyName)) {
        style.removeProperty(propertyName);
      }
    }

    // Update declarations.
    Object.keys(declarations).forEach(propertyName => {
      if (skipPseudo && propertyName.startsWith(':')) {
        // skip pseudo selectors when updating base rule.
        return;
      }

      const propertyValue = declarations[propertyName];
      if (propertyValue !== style.getPropertyValue(propertyName)) {
        style.setProperty(propertyName, propertyValue);
      }
    });
  };

  const removeRule = (ruleKey) => {
    rules[ruleKey].remove();
    delete rules[ruleKey];
  };

  // TODO: Support keyframes and media queries.
  return {
    add: (declarations) => {
      Object.keys(declarations).forEach(key => {
        if (key.startsWith(':')) {
          const pseudoSelectorDeclarations = declarations[key];
          initPseudoRule(key, pseudoSelectorDeclarations);
        }
      });

      initBaseRule(declarations);

      return getClassNames();
    },
    update: (declarations) => {
      // Remove unnused rules.
      Object.keys(rules).forEach(ruleKey => {
        if (ruleKey.startsWith(':') && !declarations.hasOwnProperty(ruleKey)) {
          removeRule(ruleKey);
        }
      });

      Object.keys(declarations).forEach(key => {
        if (key.startsWith(':')) {
          const pseudoSelectorDeclarations = declarations[key];
          updatePseudoRule(key, pseudoSelectorDeclarations);
        }
      });

      updateBaseRule(declarations);

      // TODO: Maybe remove base rule if there are no declarations?

      return getClassNames();
    },
    remove: () => {
      Object.keys(rules).forEach(removeRule);
    },
  };
};

export default createInstance;
