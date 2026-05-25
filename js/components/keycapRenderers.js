const { createElement } = React;

import { createSVGElement } from '../svg-icons.js';
import { abbreviateModifierCombo } from '../keymap-dictionary.js';
import {
    getBottomCaptionContainerStyle,
    getBottomCaptionStyle,
    getOffsetSecondaryContentStyle,
    getOffsetSecondarySlotStyle,
    getTopTagContainerStyle,
    getTopTagStyle
} from './keycapStyles.js';

function getBottomLabelSpanStyle(isLight) {
    return {
        fontSize: '11px',
        fontWeight: '500',
        color: isLight ? '#1e293b' : '#ffffff',
        fontFamily: '"Outfit", sans-serif',
        letterSpacing: '0.06em',
        lineHeight: '1',
        textTransform: 'uppercase',
        transform: 'scale(0.55)',
        transformOrigin: 'bottom center',
        display: 'inline-block',
        whiteSpace: 'nowrap'
    };
}

export function renderFluentIconWithBottomLabel({ iconKey, label, labelKey, isLight, size = 20 }) {
    const svgEl = createSVGElement(iconKey, { size, color: isLight ? '#1e293b' : '#fff' });

    return createElement('div', {
        style: {
            position: 'relative',
            width: '100%',
            height: '100%',
            boxSizing: 'border-box'
        }
    }, [
        svgEl && createElement('div', {
            key: `${labelKey}-svg-render`,
            style: {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1
            },
            dangerouslySetInnerHTML: { __html: svgEl.outerHTML }
        }),
        createElement('div', {
            key: `${labelKey}-text-label`,
            style: {
                position: 'absolute',
                bottom: '1.5px',
                left: 0,
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                zIndex: 2,
                pointerEvents: 'none',
                userSelect: 'none'
            }
        },
            createElement('span', {
                style: getBottomLabelSpanStyle(isLight)
            }, label)
        )
    ]);
}

export function renderInlineFluentIcon({ iconKey, size, color }) {
    const svgEl = createSVGElement(iconKey, { size, color });
    if (!svgEl) return null;

    return createElement('div', {
        style: {
            width: `${size}px`,
            height: `${size}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        dangerouslySetInnerHTML: { __html: svgEl.outerHTML }
    });
}

export function renderTopTag({ label, isLight, accentColor }) {
    if (!label) return null;

    return createElement('div', {
        style: getTopTagContainerStyle()
    }, createElement('span', {
        style: getTopTagStyle(isLight, accentColor)
    }, label));
}

export function renderBottomCaption({ label, isLight, color = null }) {
    if (!label) return null;
    const hasModifierSymbols = /[⌘⌥⌃⇧]/.test(label);
    const captionStyle = {
        ...getBottomCaptionStyle(isLight, color),
        ...(hasModifierSymbols ? {
            fontFamily: '"Segoe UI Symbol", "Noto Sans Symbols 2", "Apple Symbols", "Arial Unicode MS", sans-serif',
            letterSpacing: '0',
            transform: 'scale(0.56)'
        } : {})
    };

    return createElement('div', {
        style: getBottomCaptionContainerStyle()
    }, createElement('span', {
        style: captionStyle
    }, label));
}

const MOD_ICON_KEY_MAP = {
    CTRL: 'KC_LCTL',
    ALT: 'KC_LALT',
    SHFT: 'KC_LSFT',
    SHIFT: 'KC_LSFT',
    GUI: 'KC_LGUI',
    WIN: 'KC_LGUI',
    CMD: 'KC_LGUI'
};

export function renderModifierSupplement({
    modKeys,
    label,
    isLight,
    color,
    keyStyle = 'Windows',
    displayMode = 'Fluent',
    placement = 'bottom'
}) {
    if (!label) return null;
    const displayLabel = placement === 'offset'
        ? abbreviateModifierCombo(label, { keyStyle, variant: 'short3' })
        : label;

    const shouldUseModifierSvg = keyStyle === 'Mac' && displayMode === 'Fluent';
    const normalizedModKey = shouldUseModifierSvg && Array.isArray(modKeys) && modKeys.length === 1
        ? MOD_ICON_KEY_MAP[modKeys[0].toUpperCase()]
        : null;

    if (!normalizedModKey) {
        if (placement === 'offset') {
            return createElement('div', {
                style: getOffsetSecondarySlotStyle()
            }, createElement('span', {
                style: getOffsetSecondaryContentStyle(isLight, color)
            }, displayLabel));
        }

        return renderBottomCaption({
            label: displayLabel,
            isLight,
            color
        });
    }

    const size = placement === 'offset' ? 12 : 8;
    const iconElement = renderInlineFluentIcon({
        iconKey: normalizedModKey,
        size,
        color
    });

    if (!iconElement) {
        return placement === 'offset'
            ? createElement('div', {
                style: getOffsetSecondarySlotStyle()
            }, createElement('span', {
                style: getOffsetSecondaryContentStyle(isLight, color)
            }, displayLabel))
            : renderBottomCaption({ label: displayLabel, isLight, color });
    }

    const containerStyle = placement === 'offset'
        ? getOffsetSecondarySlotStyle()
        : {
            ...getBottomCaptionContainerStyle(),
            right: '4px',
            bottom: '1px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end'
        };

    return createElement('div', {
        style: containerStyle
    }, placement === 'offset' ? createElement('div', {
        style: {
            display: 'inline-flex',
            transform: 'scale(0.64)',
            transformOrigin: 'top right'
        }
    }, iconElement) : iconElement);
}
