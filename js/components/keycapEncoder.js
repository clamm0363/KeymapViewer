const { createElement } = React;

import { parseKeyLabel } from '../utils/labelParser.js';
import { buildDisplayRaw } from './keycapIconUtils.js';
import { getEncoderActions, getKeycapFrameStyle } from './keycapStyles.js';

function buildEncoderTooltipText({ encoderIndex, currentStyle, pushText, val, ccwActions, ccwLabel, cwLabel, ccwCode, cwCode }) {
    let tooltipText = `Encoder e${encoderIndex}\n`;
    tooltipText += `Push: ${pushText || 'None'} (${val || 'KC_NO'})`;

    if (!ccwActions) {
        return tooltipText;
    }

    if (currentStyle === 'VerticalWheel') {
        tooltipText += `\nUP: ${cwLabel || 'None'} (${cwCode})`;
        tooltipText += `\nDOWN: ${ccwLabel || 'None'} (${ccwCode})`;
        return tooltipText;
    }

    if (currentStyle === 'HorizontalWheel') {
        tooltipText += `\nRIGHT: ${cwLabel || 'None'} (${cwCode})`;
        tooltipText += `\nLEFT: ${ccwLabel || 'None'} (${ccwCode})`;
        return tooltipText;
    }

    tooltipText += `\nCW (Clockwise): ${cwLabel || 'None'} (${cwCode})`;
    tooltipText += `\nCCW (Counter-Clockwise): ${ccwLabel || 'None'} (${ccwCode})`;
    return tooltipText;
}

function getEncoderChildElements(currentStyle, isLight) {
    if (currentStyle === 'VerticalWheel') {
        const wheelBg = isLight
            ? `linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(255,255,255,0.4) 15%, rgba(255,255,255,0.6) 30%, rgba(255,255,255,0) 55%, rgba(0,0,0,0.45) 100%),
               repeating-linear-gradient(to right, transparent, transparent 1px, rgba(0,0,0,0.18) 1px, rgba(0,0,0,0.18) 2px),
               #94a3b8`
            : `linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(255,255,255,0.18) 15%, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0) 55%, rgba(0,0,0,0.7) 100%),
               repeating-linear-gradient(to right, transparent, transparent 1px, rgba(0,0,0,0.38) 1px, rgba(0,0,0,0.38) 2px),
               #334155`;
        return [
            createElement('div', {
                key: 'wheel-vertical',
                className: 'w-[22px] h-[36px] rounded-[3px] transition-all duration-200 group-hover:scale-x-105 group-hover:brightness-110 shadow-md shadow-black/30 group-hover:shadow-blue-500/25',
                style: {
                    background: wheelBg,
                    boxShadow: isLight
                        ? '0 2px 4px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.4)'
                        : '0 3px 6px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)'
                }
            })
        ];
    }

    if (currentStyle === 'HorizontalWheel') {
        const wheelBg = isLight
            ? `linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(255,255,255,0.4) 15%, rgba(255,255,255,0.6) 30%, rgba(255,255,255,0) 55%, rgba(0,0,0,0.45) 100%),
               repeating-linear-gradient(to bottom, transparent, transparent 1px, rgba(0,0,0,0.18) 1px, rgba(0,0,0,0.18) 2px),
               #94a3b8`
            : `linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(255,255,255,0.18) 15%, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0) 55%, rgba(0,0,0,0.7) 100%),
               repeating-linear-gradient(to bottom, transparent, transparent 1px, rgba(0,0,0,0.38) 1px, rgba(0,0,0,0.38) 2px),
               #334155`;
        return [
            createElement('div', {
                key: 'wheel-horizontal',
                className: 'w-[36px] h-[22px] rounded-[3px] transition-all duration-200 group-hover:scale-y-105 group-hover:brightness-110 shadow-md shadow-black/30 group-hover:shadow-blue-500/25',
                style: {
                    background: wheelBg,
                    boxShadow: isLight
                        ? '0 2px 4px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.4)'
                        : '0 3px 6px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)'
                }
            })
        ];
    }

    return [
        createElement('div', {
            key: 'knob-indicator',
            className: 'knob-indicator',
            style: {
                position: 'absolute',
                top: '4px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '3.5px',
                height: '8px',
                borderRadius: '1.5px',
                backgroundColor: isLight ? '#94a3b8' : '#64748b',
                opacity: 0.8
            }
        })
    ];
}

export function renderEncoderKeycap({
    k,
    i,
    val,
    fullRaw,
    onMacroClick,
    encoderStyles,
    encodersSource,
    layer,
    keyStyle,
    macroAliases,
    isLight,
    isAppDark
}) {
    const currentStyle = (encoderStyles && encoderStyles[k.encoderIndex]) || 'Dial';
    const ccwActions = getEncoderActions(encodersSource, k.encoderIndex, layer);
    let ccwLabel = '';
    let cwLabel = '';
    let ccwCode = 'KC_NO';
    let cwCode = 'KC_NO';

    if (ccwActions) {
        ccwCode = ccwActions[0] || 'KC_NO';
        cwCode = ccwActions[1] || 'KC_NO';
        const parsedCcw = parseKeyLabel(ccwCode, ccwCode, 'Text', keyStyle, macroAliases);
        const parsedCw = parseKeyLabel(cwCode, cwCode, 'Text', keyStyle, macroAliases);
        ccwLabel = parsedCcw.displayText;
        cwLabel = parsedCw.displayText;
    }

    const parsedPush = parseKeyLabel(val, k.id, 'Text', keyStyle, macroAliases);
    const pushText = parsedPush.displayText;
    const tooltipText = buildEncoderTooltipText({
        encoderIndex: k.encoderIndex,
        currentStyle,
        pushText,
        val,
        ccwActions,
        ccwLabel,
        cwLabel,
        ccwCode,
        cwCode
    });

    const displayRaw = buildDisplayRaw(fullRaw, val);
    const containerClass = (currentStyle === 'VerticalWheel' || currentStyle === 'HorizontalWheel')
        ? 'encoder-wheel-container group'
        : 'key-cap encoder-knob group';

    return createElement('div', {
        key: i,
        className: containerClass,
        title: tooltipText,
        'data-key-raw': displayRaw,
        onClick: (e) => {
            const macroMatch = fullRaw.match(/MACRO\((\d+)\)/);
            if (macroMatch && onMacroClick) {
                e.stopPropagation();
                onMacroClick(parseInt(macroMatch[1], 10));
            }
        },
        style: getKeycapFrameStyle({
            k,
            isLayerKey: false,
            encoderStyles,
            isLight,
            isAppDark
        })
    }, getEncoderChildElements(currentStyle, isLight));
}
