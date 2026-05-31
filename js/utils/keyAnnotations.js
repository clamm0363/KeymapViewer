/**
 * Key annotations utility functions.
 * These are pure functions and are fully testable.
 */

/**
 * Get annotation for a specific key.
 * @param {Object} keyAnnotations
 * @param {string} matrixKey
 * @returns {Object|null} Annotation object { customText, description, iconKey } or null
 */
export function getAnnotation(keyAnnotations, matrixKey) {
  if (!keyAnnotations || !matrixKey) return null;
  const annotation = keyAnnotations[matrixKey];
  if (!annotation) return null;
  return {
    customText: annotation.customText || '',
    description: annotation.description || '',
    iconKey: annotation.iconKey || '',
  };
}

/**
 * Set or update annotation for a specific key (immutable operation).
 * @param {Object} keyAnnotations
 * @param {string} matrixKey
 * @param {Object} data { customText, description, iconKey }
 * @returns {Object} A new keyAnnotations object
 */
export function setAnnotation(keyAnnotations, matrixKey, data) {
  if (!matrixKey) return keyAnnotations || {};
  const current = keyAnnotations || {};
  return {
    ...current,
    [matrixKey]: {
      customText: data?.customText || '',
      description: data?.description || '',
      iconKey: data?.iconKey || '',
    },
  };
}

/**
 * Clear annotation for a specific key (immutable operation).
 * @param {Object} keyAnnotations
 * @param {string} matrixKey
 * @returns {Object} A new keyAnnotations object
 */
export function clearAnnotation(keyAnnotations, matrixKey) {
  if (!keyAnnotations || !matrixKey) return keyAnnotations || {};
  const next = { ...keyAnnotations };
  delete next[matrixKey];
  return next;
}

/**
 * Check if a key has any valid annotation text or description.
 * @param {Object} keyAnnotations
 * @param {string} matrixKey
 * @returns {boolean}
 */
export function hasAnnotation(keyAnnotations, matrixKey) {
  const annotation = getAnnotation(keyAnnotations, matrixKey);
  if (!annotation) return false;
  return !!(annotation.customText || annotation.description);
}

/**
 * Get list of all key IDs / matrix keys that have annotations.
 * @param {Object} keyAnnotations
 * @returns {string[]} Array of matrixKeys/ids
 */
export function getAnnotatedKeys(keyAnnotations) {
  if (!keyAnnotations) return [];
  return Object.keys(keyAnnotations).filter((key) => {
    return hasAnnotation(keyAnnotations, key);
  });
}
