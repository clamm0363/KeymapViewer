function isObjectLike(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

function hasLayoutsKeymap(value) {
    return isObjectLike(value?.layouts) && Array.isArray(value.layouts.keymap);
}

function hasMatrixInfo(value) {
    return isObjectLike(value?.matrix) && Number.isFinite(Number(value.matrix.rows)) && Number.isFinite(Number(value.matrix.cols));
}

export function isLayoutJson(value) {
    return hasLayoutsKeymap(value) && hasMatrixInfo(value);
}

export function isMappingJson(value) {
    return Array.isArray(value?.layers);
}

export function getLayoutJsonErrorMessage(value) {
    if (isMappingJson(value) && !isLayoutJson(value)) {
        return 'いま必要なのは LAYOUT 用 JSON です。選択したファイルは MAPPING 用 JSON のようです。公式配布の定義 JSON など、layouts / matrix を含む LAYOUT 用ファイルを選択してください。';
    }

    return 'LAYOUT 情報が見つかりません。layouts / matrix を含む LAYOUT 用 JSON を選択してください。';
}

export function getMappingJsonErrorMessage() {
    return 'MAPPING 情報が見つかりません。layers を含む MAPPING 用 JSON を選択してください。';
}

export function normalizeLayoutJson(value) {
    if (!isLayoutJson(value)) {
        throw new Error(getLayoutJsonErrorMessage(value));
    }

    return {
        ...value,
        matrix: {
            ...value.matrix,
            rows: Number(value.matrix.rows),
            cols: Number(value.matrix.cols)
        },
        encoders: Array.isArray(value.encoders) ? value.encoders : []
    };
}

export function normalizeMappingJson(value) {
    if (!isMappingJson(value)) {
        throw new Error(getMappingJsonErrorMessage());
    }

    return {
        ...value,
        layers: value.layers,
        macros: Array.isArray(value.macros) ? value.macros : [],
        macroAliases: isObjectLike(value.macroAliases) ? value.macroAliases : {},
        encoders: Array.isArray(value.encoders) ? value.encoders : []
    };
}
