const convertStylesObjectToRuleDescriptionList = (stylesObject) => {
  const ruleDescriptionList = [];
  let baseDeclarations = undefined;

  // NOTE: This assumes that object key iteration preserves order.
  const keys = Object.keys(stylesObject);
  const length = keys.length;

  const keyIsNotBaseStyle = (i) => (
    i >= length || keys[i].startsWith(':')
  );

  for (let i = 0; i < length; i++) {
    const key = keys[i];

    // TODO: Support @-rules.
    if (key.startsWith(':')) {
      ruleDescriptionList.push({
        type: 'style',
        pseudoSelector: key,
        declarations: stylesObject[key],
      });
    } else {
      // Build up base styles.
      if (!baseDeclarations) {
        baseDeclarations = {};
      }

      baseDeclarations[key] = stylesObject[key];

      if (keyIsNotBaseStyle(i + 1)) {
        ruleDescriptionList.push({
          type: 'style',
          pseudoSelector: '',
          declarations: baseDeclarations,
        });
        baseDeclarations = undefined;
      }
    }
  }

  return ruleDescriptionList;
};

export default convertStylesObjectToRuleDescriptionList;
