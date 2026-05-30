import { normalizeDeviceDefinition } from './definitionUtils.js';

const DEVICE_LAYOUT_REGISTRY = [];

export const SUPPORTED_HID_FILTERS = DEVICE_LAYOUT_REGISTRY.map((entry) => ({
  vendorId: entry.vendorId,
  productId: entry.productId,
  usagePage: 0xff60,
}));

export function buildVendorProductId(vendorId, productId) {
  return (((vendorId & 0xffff) << 16) | (productId & 0xffff)) >>> 0;
}

export function findSupportedDeviceConfig(vendorId, productId) {
  return (
    DEVICE_LAYOUT_REGISTRY.find(
      (entry) => entry.vendorId === vendorId && entry.productId === productId
    ) || null
  );
}

export async function loadDeviceDefinition(deviceConfig) {
  if (!deviceConfig || !deviceConfig.layoutPath) {
    throw new Error('対応デバイス定義が見つかりませんでした。');
  }

  const response = await fetch(encodeURI(deviceConfig.layoutPath), { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`デバイス定義の読み込みに失敗しました: ${deviceConfig.layoutPath}`);
  }

  return normalizeDeviceDefinition(await response.json());
}
