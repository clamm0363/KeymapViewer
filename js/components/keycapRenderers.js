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

function getModifierIconKeys(modKeys = []) {
    if (!Array.isArray(modKeys) || modKeys.length === 0) return [];
    return modKeys
        .map((modKey) => MOD_ICON_KEY_MAP[String(modKey || '').toUpperCase()])
        .filter(Boolean);
}

function renderModifierPlusSeparator({ placement, color, isLight }) {
    const size = placement === 'offset' ? 12 : 8;
    const strokeWidth = placement === 'offset' ? 1.5 : 1.25;
    const separatorColor = color || (isLight ? '#64748b' : '#94a3b8');
    const opacity = color ? (isLight ? 0.96 : 0.94) : (placement === 'offset' ? 0.82 : 0.78);
    const half = size / 2;
    const arm = placement === 'offset' ? 2.5 : 1.75;

    return createElement('div', {
        style: {
            display: 'inline-flex',
            width: `${size}px`,
            height: `${size}px`,
            alignItems: 'center',
            justifyContent: 'center',
            flex: '0 0 auto',
            opacity
        }
    }, createElement('svg', {
        width: size,
        height: size,
        viewBox: `0 0 ${size} ${size}`,
        fill: 'none',
        xmlns: 'http://www.w3.org/2000/svg'
    }, [
        createElement('line', {
            key: 'plus-h',
            x1: half - arm,
            y1: half,
            x2: half + arm,
            y2: half,
            stroke: separatorColor,
            strokeWidth,
            strokeLinecap: 'round'
        }),
        createElement('line', {
            key: 'plus-v',
            x1: half,
            y1: half - arm,
            x2: half,
            y2: half + arm,
            stroke: separatorColor,
            strokeWidth,
            strokeLinecap: 'round'
        })
    ]));
}

function renderModifierSvgSequence({ iconKeys, placement, color, isLight }) {
    if (!Array.isArray(iconKeys) || iconKeys.length === 0) return null;

    const size = placement === 'offset' ? 12 : 8;
    const gap = placement === 'offset' ? '1px' : '0.5px';
    const scale = placement === 'offset' ? 0.64 : 1;
    const iconElements = iconKeys
        .map((iconKey, idx) => {
            const iconElement = renderInlineFluentIcon({
                iconKey,
                size,
                color
            });
            if (!iconElement) return null;
            const items = [];
            if (idx > 0) {
                items.push(createElement(React.Fragment, {
                    key: `plus-${idx}`
                }, renderModifierPlusSeparator({
                    placement,
                    color,
                    isLight
                })));
            }
            items.push(createElement('div', {
                key: `${iconKey}-${idx}`,
                style: {
                    display: 'inline-flex',
                    width: `${size}px`,
                    height: `${size}px`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: '0 0 auto'
                }
            }, iconElement));
            return items;
        })
        .flat()
        .filter(Boolean);

    if (iconElements.length === 0) return null;

    return createElement('div', {
        style: {
            display: 'inline-flex',
            alignItems: placement === 'offset' ? 'flex-start' : 'center',
            justifyContent: 'flex-end',
            gap,
            transform: scale !== 1 ? `scale(${scale})` : 'none',
            transformOrigin: placement === 'offset' ? 'top right' : 'bottom right'
        }
    }, iconElements);
}

function isNamedModifierComboLabel(label, modKeys = []) {
    if (!label || !Array.isArray(modKeys)) return false;
    return modKeys.length > 1 && !String(label).includes('+');
}

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

    const shouldUseModifierSvg = keyStyle === 'Mac'
        && displayMode === 'Fluent'
        && !isNamedModifierComboLabel(label, modKeys);
    const modifierIconKeys = shouldUseModifierSvg ? getModifierIconKeys(modKeys) : [];
    const hasModifierSvg = modifierIconKeys.length > 0;

    if (!hasModifierSvg) {
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

    const iconSequence = renderModifierSvgSequence({
        iconKeys: modifierIconKeys,
        placement,
        color,
        isLight
    });

    if (!iconSequence) {
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
    }, iconSequence);
}
