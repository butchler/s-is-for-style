// requestIdleCallback polyfill, falling back to setTimeout.
const FALLBACK_TIMEOUT = 60 * 1000;

const hasIdleCallback = (
  typeof requestIdleCallback === 'function' &&
  typeof cancelIdleCallback === 'function'
);

export const requestIdleCallback = (
  hasIdleCallback ?
    requestIdleCallback :
    (callback) => setTimeout(callback, FALLBACK_TIMEOUT)
);

export const cancelIdleCallback = (
  hasIdleCallback ?
    cancelIdleCallback :
    clearTimeout
);
