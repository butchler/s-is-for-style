const injectStyleTag = () => {
  // TODO: Add data attribute.
  // TODO: Remove any existing server-rendered sheets.
  const styleTag = document.createElement('style');
  styleTag.setAttribute('type', 'text/css');
  document.head.appendChild(styleTag);
  return styleTag;
};

export default injectStyleTag;
