import { getKeycodeTooltipInfo } from '../keymap-dictionary.js';
import { buildKeyInspectorTooltipLines } from '../utils/keyInspector.js';

function joinTooltipLines(lines) {
    return lines.filter(Boolean).join('\n');
}

function getMacroActionLabel(code, keyStyle = 'Windows') {
    const tooltipInfo = getKeycodeTooltipInfo(code, code, keyStyle);
    const description = tooltipInfo.description || tooltipInfo.officialCode || String(code || '').trim().toUpperCase();
    return description.replace(/\s*\([^)]*\)\s*$/u, '');
}

function formatLiteralText(text) {
    const normalized = String(text || '').replace(/\r/g, '');
    if (!normalized) return '';
    return `Type "${normalized}"`;
}

function translateMacroStep(token, keyStyle = 'Windows') {
    const source = String(token || '').trim();
    if (!source) return '';

    if (/^\d+$/.test(source)) {
        return `Wait ${source} ms`;
    }

    if (source.startsWith('+')) {
        return `Hold ${getMacroActionLabel(source.slice(1), keyStyle)}`;
    }

    if (source.startsWith('-')) {
        return `Release ${getMacroActionLabel(source.slice(1), keyStyle)}`;
    }

    if (source.includes(',')) {
        const keys = source.split(',').map((part) => getMacroActionLabel(part.trim(), keyStyle)).filter(Boolean);
        return keys.length > 0 ? `Tap ${keys.join(' + ')}` : '';
    }

    return `Tap ${getMacroActionLabel(source, keyStyle)}`;
}

function translateMacroContent(content, keyStyle = 'Windows') {
    const source = String(content || '');
    if (!source) return [];

    const tokens = source.match(/\{[^}]*\}|[^{}]+/g) || [];
    const steps = [];

    tokens.forEach((token) => {
        if (token.startsWith('{') && token.endsWith('}')) {
            const translated = translateMacroStep(token.slice(1, -1), keyStyle);
            if (translated) steps.push(translated);
            return;
        }

        const literal = formatLiteralText(token);
        if (literal) steps.push(literal);
    });

    return steps;
}

function getMacroContentInfo(code, macros = []) {
    const source = String(code || '').trim();
    const match = source.match(/^MACRO\((\d+)\)$/i);
    if (!match) return null;

    const macroId = Number(match[1]);
    const content = Array.isArray(macros) ? macros[macroId] : '';
    return {
        macroId,
        content: typeof content === 'string' ? content : ''
    };
}

function appendMacroContentLines(lines, code, macros = [], keyStyle = 'Windows') {
    const macroInfo = getMacroContentInfo(code, macros);
    if (!macroInfo) return;

    if (macroInfo.content) {
        const translatedSteps = translateMacroContent(macroInfo.content, keyStyle);
        lines.push('Macro actions:');
        if (translatedSteps.length > 0) {
            translatedSteps.forEach((step) => lines.push(step));
        } else {
            lines.push(macroInfo.content);
        }
        return;
    }

    lines.push('Macro actions: Empty');
}

function formatActionLine(prefix, label, tooltipInfo, code, macros = []) {
    const lines = [`${prefix}: ${label || 'None'} (${tooltipInfo.officialCode || 'KC_NO'})`];
    if (tooltipInfo.description) {
        lines.push(`  ${tooltipInfo.description}`);
    }
    appendMacroContentLines(lines, code, macros, tooltipInfo.keyStyle || 'Windows');
    return lines.join('\n');
}

export function buildStandardKeyTooltip(code, keyStyle = 'Windows', macros = [], inspectorData = null) {
    const tooltipInfo = getKeycodeTooltipInfo(code, code, keyStyle);
    const lines = [tooltipInfo.officialCode];

    if (tooltipInfo.description) {
        lines.push(tooltipInfo.description);
    }

    appendMacroContentLines(lines, code, macros, keyStyle);

    if (tooltipInfo.isAliasInput) {
        lines.push(`Input: ${tooltipInfo.inputCode}`);
    }

    const inspectorLines = buildKeyInspectorTooltipLines(inspectorData);
    if (inspectorLines.length > 0) {
        lines.push('');
        inspectorLines.forEach((line) => lines.push(line));
    }

    return joinTooltipLines(lines);
}

export function buildEncoderActionTooltip(prefix, label, code, keyStyle = 'Windows', macros = []) {
    const tooltipInfo = getKeycodeTooltipInfo(code, code, keyStyle);
    return formatActionLine(prefix, label, { ...tooltipInfo, keyStyle }, code, macros);
}

export function buildEncoderTooltip({
    encoderIndex,
    pushText,
    pushCode,
    macros = [],
    keyStyle = 'Windows',
    currentStyle,
    ccwActions,
    ccwLabel,
    cwLabel,
    ccwCode,
    cwCode,
    trackballCwPrefix = 'CW-MAPPED',
    trackballCcwPrefix = 'CCW-MAPPED'
}) {
    const lines = [`Encoder e${encoderIndex}`];

    lines.push(buildEncoderActionTooltip('Push', pushText, pushCode || 'KC_NO', keyStyle, macros));

    if (!ccwActions) {
        return joinTooltipLines(lines);
    }

    if (currentStyle === 'VerticalWheel') {
        lines.push(buildEncoderActionTooltip('UP', cwLabel, cwCode, keyStyle, macros));
        lines.push(buildEncoderActionTooltip('DOWN', ccwLabel, ccwCode, keyStyle, macros));
        return joinTooltipLines(lines);
    }

    if (currentStyle === 'HorizontalWheel') {
        lines.push(buildEncoderActionTooltip('RIGHT', cwLabel, cwCode, keyStyle, macros));
        lines.push(buildEncoderActionTooltip('LEFT', ccwLabel, ccwCode, keyStyle, macros));
        return joinTooltipLines(lines);
    }

    if (currentStyle === 'Trackball' || currentStyle === 'Touchpad') {
        lines.push(buildEncoderActionTooltip(trackballCwPrefix, cwLabel, cwCode, keyStyle, macros));
        lines.push(buildEncoderActionTooltip(trackballCcwPrefix, ccwLabel, ccwCode, keyStyle, macros));
        return joinTooltipLines(lines);
    }

    lines.push(buildEncoderActionTooltip('CW (Clockwise)', cwLabel, cwCode, keyStyle, macros));
    lines.push(buildEncoderActionTooltip('CCW (Counter-Clockwise)', ccwLabel, ccwCode, keyStyle, macros));
    return joinTooltipLines(lines);
}
