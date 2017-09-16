const injectStyleTag = () => {
  // Remove any existing sheets.
  // TODO: Make selector configurable, and add configurable classname prefix.
  const oldTags = [...document.querySelectorAll('[data-s-sheet=true]')];
  while (oldTags.length > 0) {
    const element = oldTags.pop();
    element.parentNode.removeChild(element);
  }

  const styleTag = document.createElement('style');
  styleTag.setAttribute('type', 'text/css');
  styleTag.setAttribute('data-s-sheet', true);
  document.head.appendChild(styleTag);
  return styleTag;
};

export default injectStyleTag;
