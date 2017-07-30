// Returns a function that returns a minimal and unique class name each time it is called.
// This implementation is copied directly from styletron. I actually have no idea how it works...
//
// TODO: Support class name prefix.
const makeGetUniqueClassName = () => {
  let uniqueCount = 0;
  let offset = 10; // skip 0-9
  let msb = 35;
  let power = 1;

  const getNextUniqueClassName = () => {
    // Get the next virtual class number, while setting
    // the uniqueCount, offset, and msb counters appropriately.
    const virtualCount = uniqueCount + offset;
    if (virtualCount === msb) {
      offset += (msb + 1) * 9;
      msb = Math.pow(36, ++power) - 1;
    }
    uniqueCount++;

    const uniqueClassName = virtualCount.toString(36);

    // Skip the classname 'ad', because most ad blockers hide elements with it.
    if (uniqueClassName === 'ad') {
      return getNextUniqueClassName();
    } else {
      return uniqueClassName;
    }
  };

  return getNextUniqueClassName;
};

export default makeGetUniqueClassName;
