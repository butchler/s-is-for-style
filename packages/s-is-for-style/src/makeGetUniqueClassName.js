// TODO: Make a proper name generator.
const makeGetUniqueClassName = () => {
  let idIndex = 0;
  const getUniqueClassName = () => {
    const id = idIndex;
    idIndex += 1;
    return `class-${id}`;
  };

  return getUniqueClassName;
};

export default makeGetUniqueClassName;
