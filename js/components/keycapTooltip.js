import { getKeycodeTooltipInfo } from '../keymap-dictionary.js';

function joinTooltipLines(lines) {
    return lines.filter(Boolean).join('\n');
}

function formatActionLine(prefix, label, tooltipInfo) {
    const lines = [`${prefix}: ${label || 'None'} (${tooltipInfo.officialCode || 'KC_NO'})`];
    if (tooltipInfo.description) {
        lines.push(`  ${tooltipInfo.description}`);
    }
    return lines.join('\n');
}

export function buildStandardKeyTooltip(code, keyStyle = 'Windows') {
    const tooltipInfo = getKeycodeTooltipInfo(code, code, keyStyle);
    const lines = [tooltipInfo.officialCode];

    if (tooltipInfo.description) {
        lines.push(tooltipInfo.description);
    }

    if (tooltipInfo.isAliasInput) {
        lines.push(`Input: ${tooltipInfo.inputCode}`);
    }

    return joinTooltipLines(lines);
}

export function buildEncoderActionTooltip(prefix, label, code, keyStyle = 'Windows') {
    const tooltipInfo = getKeycodeTooltipInfo(code, code, keyStyle);
    return formatActionLine(prefix, label, tooltipInfo);
}

export function buildEncoderTooltip({
    encoderIndex,
    pushText,
    pushCode,
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

    lines.push(buildEncoderActionTooltip('Push', pushText, pushCode || 'KC_NO', keyStyle));

    if (!ccwActions) {
        return joinTooltipLines(lines);
    }

    if (currentStyle === 'VerticalWheel') {
        lines.push(buildEncoderActionTooltip('UP', cwLabel, cwCode, keyStyle));
        lines.push(buildEncoderActionTooltip('DOWN', ccwLabel, ccwCode, keyStyle));
        return joinTooltipLines(lines);
    }

    if (currentStyle === 'HorizontalWheel') {
        lines.push(buildEncoderActionTooltip('RIGHT', cwLabel, cwCode, keyStyle));
        lines.push(buildEncoderActionTooltip('LEFT', ccwLabel, ccwCode, keyStyle));
        return joinTooltipLines(lines);
    }

    if (currentStyle === 'Trackball' || currentStyle === 'Touchpad') {
        lines.push(buildEncoderActionTooltip(trackballCwPrefix, cwLabel, cwCode, keyStyle));
        lines.push(buildEncoderActionTooltip(trackballCcwPrefix, ccwLabel, ccwCode, keyStyle));
        return joinTooltipLines(lines);
    }

    lines.push(buildEncoderActionTooltip('CW (Clockwise)', cwLabel, cwCode, keyStyle));
    lines.push(buildEncoderActionTooltip('CCW (Counter-Clockwise)', ccwLabel, ccwCode, keyStyle));
    return joinTooltipLines(lines);
}
