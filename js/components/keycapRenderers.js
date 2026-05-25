const { createElement } = React;

import { createSVGElement } from '../svg-icons.js';

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
