import { LOCAL_DEVICE_DEFINITION_STORAGE_KEY } from '../../constants.js';
import { normalizeDeviceDefinition } from './definitionUtils.js';

function buildStorageKey(vendorId, productId) {
    return `${vendorId}:${productId}`;
}

function readDefinitionIndex() {
    try {
        const raw = localStorage.getItem(LOCAL_DEVICE_DEFINITION_STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch (error) {
        console.warn('Failed to read local device definitions:', error);
        return {};
    }
}

function writeDefinitionIndex(index) {
    localStorage.setItem(LOCAL_DEVICE_DEFINITION_STORAGE_KEY, JSON.stringify(index));
}

export function findLocalDeviceDefinition(vendorId, productId) {
    const index = readDefinitionIndex();
    const entry = index[buildStorageKey(vendorId, productId)];
    if (!entry || !entry.definition) {
        return null;
    }

    try {
        return {
            ...entry,
            definition: normalizeDeviceDefinition(entry.definition)
        };
    } catch (error) {
        console.warn('Ignoring invalid cached device definition:', error);
        return null;
    }
}

export function saveLocalDeviceDefinition(definition) {
    const normalized = normalizeDeviceDefinition(definition);
    const index = readDefinitionIndex();
    const key = buildStorageKey(normalized.vendorId, normalized.productId);
    index[key] = {
        vendorId: normalized.vendorId,
        productId: normalized.productId,
        name: normalized.name || '',
        savedAt: new Date().toISOString(),
        definition: normalized
    };
    writeDefinitionIndex(index);
    return index[key];
}

export function removeLocalDeviceDefinition(vendorId, productId) {
    const index = readDefinitionIndex();
    const key = buildStorageKey(vendorId, productId);
    if (!Object.prototype.hasOwnProperty.call(index, key)) {
        return false;
    }

    delete index[key];
    writeDefinitionIndex(index);
    return true;
}
