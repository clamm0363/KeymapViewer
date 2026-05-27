const DEVICE_LAYOUT_REGISTRY = [
    { vendorId: 0x3434, productId: 0x0A06, layoutPath: 'json/k0_max_v1.1_20250904.json' },
    { vendorId: 0x3434, productId: 0x0131, layoutPath: 'json/q0_plus_v1.0.json' },
    { vendorId: 0x36b0, productId: 0x3083, layoutPath: 'json/ZUOYA_GMK26.json' },
    { vendorId: 0x342d, productId: 0xe491, layoutPath: 'json/ZUOYA+GMK70.json' },
    { vendorId: 0x388d, productId: 0x0002, layoutPath: 'json/OE927 flow2 84-json-20251114.json' }
];

export const SUPPORTED_HID_FILTERS = DEVICE_LAYOUT_REGISTRY.map((entry) => ({
    vendorId: entry.vendorId,
    productId: entry.productId,
    usagePage: 0xff60
}));

export function buildVendorProductId(vendorId, productId) {
    return (((vendorId & 0xffff) << 16) | (productId & 0xffff)) >>> 0;
}

export function findSupportedDeviceConfig(vendorId, productId) {
    return DEVICE_LAYOUT_REGISTRY.find((entry) => entry.vendorId === vendorId && entry.productId === productId) || null;
}

export async function loadDeviceDefinition(deviceConfig) {
    if (!deviceConfig || !deviceConfig.layoutPath) {
        throw new Error('対応デバイス定義が見つかりませんでした。');
    }

    const response = await fetch(encodeURI(deviceConfig.layoutPath), { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`デバイス定義の読み込みに失敗しました: ${deviceConfig.layoutPath}`);
    }

    return response.json();
}
