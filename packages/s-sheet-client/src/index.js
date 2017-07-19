const createSheet = () => {
  // TODO: Add data attribute.
  // TODO: Remove any existing server-rendered sheets.
  const styleTag = document.createElement('style');
  document.head.appendChild(styleTag);
  const sheet = styleTag.sheet;

  let idIndex = 0;
  const getUniqueId = () => {
    const id = idIndex;
    idIndex += 1;
    return `class-${id}`;
  };

  return {
    addStyleRule: (pseudoSelector) => {
      // TODO: Reuse unused rules.
      const className = getUniqueId();
      const ruleString = `.${className}${pseudoSelector || ''}{}`;
      const index = sheet.insertRule(ruleString, sheet.cssRules.length);

      return {
        className,
        rule: sheet.cssRules[index],
        remove: () => {
          // TODO: Mark rule as unused.
        },
      };
    },
  };
};

export default createSheet;
