/**
 * Key annotations utility functions.
 * These are pure functions and are fully testable.
 */

function normalizeLayerKey(layer) {
  const numeric = Number(layer);
  return Number.isFinite(numeric) ? String(numeric) : '0';
}

function normalizeAnnotationEntry(annotation) {
  if (!annotation || typeof annotation !== 'object') return null;
  return {
    customText: annotation.customText || '',
    description: annotation.description || '',
    iconKey: annotation.iconKey || '',
  };
}

function isAnnotationLeaf(value) {
  return !!(
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    ('customText' in value || 'description' in value || 'iconKey' in value)
  );
}

function isLegacyAnnotationMap(keyAnnotations) {
  if (!keyAnnotations || typeof keyAnnotations !== 'object' || Array.isArray(keyAnnotations)) {
    return false;
  }

  return Object.values(keyAnnotations).some((value) => isAnnotationLeaf(value));
}

function normalizeAnnotationMap(annotationMap) {
  if (!annotationMap || typeof annotationMap !== 'object' || Array.isArray(annotationMap)) {
    return {};
  }

  const next = {};
  Object.entries(annotationMap).forEach(([matrixKey, annotation]) => {
    const normalized = normalizeAnnotationEntry(annotation);
    if (normalized) {
      next[matrixKey] = normalized;
    }
  });
  return next;
}

export function normalizeKeyAnnotations(keyAnnotations) {
  if (!keyAnnotations || typeof keyAnnotations !== 'object' || Array.isArray(keyAnnotations)) {
    return {};
  }

  if (isLegacyAnnotationMap(keyAnnotations)) {
    return {
      '0': normalizeAnnotationMap(keyAnnotations),
    };
  }

  const next = {};
  Object.entries(keyAnnotations).forEach(([layerKey, annotationMap]) => {
    const normalizedMap = normalizeAnnotationMap(annotationMap);
    if (Object.keys(normalizedMap).length > 0) {
      next[normalizeLayerKey(layerKey)] = normalizedMap;
    }
  });
  return next;
}

export function getLayerAnnotations(keyAnnotations, layer = 0) {
  const normalized = normalizeKeyAnnotations(keyAnnotations);
  return normalized[normalizeLayerKey(layer)] || {};
}

/**
 * Get annotation for a specific key.
 * @param {Object} keyAnnotations
 * @param {string} matrixKey
 * @param {number|string} layer
 * @returns {Object|null} Annotation object { customText, description, iconKey } or null
 */
export function getAnnotation(keyAnnotations, matrixKey, layer = 0) {
  if (!matrixKey) return null;
  const annotation = getLayerAnnotations(keyAnnotations, layer)[matrixKey];
  return normalizeAnnotationEntry(annotation);
}

/**
 * Set or update annotation for a specific key (immutable operation).
 * @param {Object} keyAnnotations
 * @param {string} matrixKey
 * @param {Object} data { customText, description, iconKey }
 * @param {number|string} layer
 * @returns {Object} A new keyAnnotations object
 */
export function setAnnotation(keyAnnotations, matrixKey, data, layer = 0) {
  if (!matrixKey) return normalizeKeyAnnotations(keyAnnotations);

  const normalized = normalizeKeyAnnotations(keyAnnotations);
  const layerKey = normalizeLayerKey(layer);
  const currentLayerAnnotations = normalized[layerKey] || {};

  return {
    ...normalized,
    [layerKey]: {
      ...currentLayerAnnotations,
      [matrixKey]: {
        customText: data?.customText || '',
        description: data?.description || '',
        iconKey: data?.iconKey || '',
      },
    },
  };
}

/**
 * Clear annotation for a specific key (immutable operation).
 * @param {Object} keyAnnotations
 * @param {string} matrixKey
 * @param {number|string} layer
 * @returns {Object} A new keyAnnotations object
 */
export function clearAnnotation(keyAnnotations, matrixKey, layer = 0) {
  const normalized = normalizeKeyAnnotations(keyAnnotations);
  if (!matrixKey) return normalized;

  const layerKey = normalizeLayerKey(layer);
  if (!normalized[layerKey] || !normalized[layerKey][matrixKey]) {
    return normalized;
  }

  const nextLayerAnnotations = { ...normalized[layerKey] };
  delete nextLayerAnnotations[matrixKey];

  if (Object.keys(nextLayerAnnotations).length === 0) {
    const next = { ...normalized };
    delete next[layerKey];
    return next;
  }

  return {
    ...normalized,
    [layerKey]: nextLayerAnnotations,
  };
}

/**
 * Check if a key has any valid annotation text or description.
 * @param {Object} keyAnnotations
 * @param {string} matrixKey
 * @param {number|string} layer
 * @returns {boolean}
 */
export function hasAnnotation(keyAnnotations, matrixKey, layer = 0) {
  const annotation = getAnnotation(keyAnnotations, matrixKey, layer);
  if (!annotation) return false;
  return !!(annotation.customText || annotation.description);
}

/**
 * Get list of all key IDs / matrix keys that have annotations.
 * @param {Object} keyAnnotations
 * @param {number|string} layer
 * @returns {string[]} Array of matrixKeys/ids
 */
export function getAnnotatedKeys(keyAnnotations, layer = 0) {
  const layerAnnotations = getLayerAnnotations(keyAnnotations, layer);
  return Object.keys(layerAnnotations).filter((key) => hasAnnotation(layerAnnotations, key, 0));
}
