function parseUsbId(value) {
    if (Number.isFinite(value)) {
        return Number(value) & 0xffff;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return null;
        const parsed = trimmed.startsWith('0x') || trimmed.startsWith('0X')
            ? Number.parseInt(trimmed, 16)
            : Number.parseInt(trimmed, 10);
        return Number.isFinite(parsed) ? (parsed & 0xffff) : null;
    }

    return null;
}

function parseVendorProductId(value) {
    if (Number.isFinite(value)) {
        return Number(value) >>> 0;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return null;
        const parsed = trimmed.startsWith('0x') || trimmed.startsWith('0X')
            ? Number.parseInt(trimmed, 16)
            : Number.parseInt(trimmed, 10);
        return Number.isFinite(parsed) ? (parsed >>> 0) : null;
    }

    return null;
}

function extractVendorAndProductId(definition) {
    const directVendorId = parseUsbId(definition?.vendorId);
    const directProductId = parseUsbId(definition?.productId);
    if (directVendorId !== null && directProductId !== null) {
        return { vendorId: directVendorId, productId: directProductId };
    }

    const combined = parseVendorProductId(definition?.vendorProductId);
    if (combined !== null) {
        return {
            vendorId: (combined >>> 16) & 0xffff,
            productId: combined & 0xffff
        };
    }

    return { vendorId: null, productId: null };
}

export function formatUsbId(value) {
    const normalized = parseUsbId(value);
    if (normalized === null) return '----';
    return `0x${normalized.toString(16).toUpperCase().padStart(4, '0')}`;
}

export function normalizeDeviceDefinition(definition) {
    if (!definition || typeof definition !== 'object' || Array.isArray(definition)) {
        throw new Error('定義JSONの形式が不正です。');
    }

    const { vendorId, productId } = extractVendorAndProductId(definition);
    if (vendorId === null || productId === null) {
        throw new Error('定義JSONに vendorId / productId がありません。');
    }

    const rows = Number(definition.matrix?.rows);
    const cols = Number(definition.matrix?.cols);
    if (!Number.isFinite(rows) || !Number.isFinite(cols) || rows <= 0 || cols <= 0) {
        throw new Error('定義JSONに有効な matrix 情報がありません。');
    }

    if (!definition.layouts || !definition.layouts.keymap || !Array.isArray(definition.layouts.keymap)) {
        throw new Error('定義JSONに有効な layouts.keymap 情報がありません。');
    }

    return {
        ...definition,
        vendorId,
        productId,
        matrix: {
            ...definition.matrix,
            rows,
            cols
        }
    };
}

export function validateDefinitionForDevice(definition, device) {
    const normalized = normalizeDeviceDefinition(definition);
    if (!device) {
        return normalized;
    }

    const expectedVendorId = parseUsbId(device.vendorId);
    const expectedProductId = parseUsbId(device.productId);
    if (normalized.vendorId !== expectedVendorId || normalized.productId !== expectedProductId) {
        throw new Error(
            `選択した定義JSONの VID/PID (${formatUsbId(normalized.vendorId)} / ${formatUsbId(normalized.productId)}) が接続デバイス (${formatUsbId(expectedVendorId)} / ${formatUsbId(expectedProductId)}) と一致しません。`
        );
    }

    return normalized;
}
