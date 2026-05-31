const { createElement } = React;

import { parseKeyLabel } from '../utils/labelParser.js';
import { buildDisplayRaw } from './keycapIconUtils.js';
import { buildEncoderTooltip } from './keycapTooltip.js';
import { getEncoderActions, getKeycapFrameStyle } from './keycapStyles.js';
import { resolveInputDeviceSetting } from './inputDeviceSettings.js';

function getPointingKeyMeta(keycode) {
  const code = (keycode || 'KC_NO').toUpperCase();
  const normalized = code.startsWith('KC_') ? code : `KC_${code}`;

  const pointingMap = {
    KC_MS_U: { kind: 'cursor', axisLabel: 'CURSOR UP' },
    KC_MS_D: { kind: 'cursor', axisLabel: 'CURSOR DOWN' },
    KC_MS_L: { kind: 'cursor', axisLabel: 'CURSOR LEFT' },
    KC_MS_R: { kind: 'cursor', axisLabel: 'CURSOR RIGHT' },
    KC_WH_U: { kind: 'wheel', axisLabel: 'WHEEL UP' },
    KC_WH_D: { kind: 'wheel', axisLabel: 'WHEEL DOWN' },
    KC_WH_L: { kind: 'wheel', axisLabel: 'WHEEL LEFT' },
    KC_WH_R: { kind: 'wheel', axisLabel: 'WHEEL RIGHT' },
    KC_BTN1: { kind: 'button', axisLabel: 'BUTTON 1' },
    KC_BTN2: { kind: 'button', axisLabel: 'BUTTON 2' },
    KC_BTN3: { kind: 'button', axisLabel: 'BUTTON 3' },
    KC_BTN4: { kind: 'button', axisLabel: 'BUTTON 4' },
    KC_BTN5: { kind: 'button', axisLabel: 'BUTTON 5' },
    KC_BTN6: { kind: 'button', axisLabel: 'BUTTON 6' },
    KC_BTN7: { kind: 'button', axisLabel: 'BUTTON 7' },
    KC_BTN8: { kind: 'button', axisLabel: 'BUTTON 8' },
    KC_ACL0: { kind: 'accel', axisLabel: 'ACCEL 0' },
    KC_ACL1: { kind: 'accel', axisLabel: 'ACCEL 1' },
    KC_ACL2: { kind: 'accel', axisLabel: 'ACCEL 2' },
  };

  return pointingMap[normalized] || null;
}

function getTrackballTooltipPrefixes(cwCode, ccwCode) {
  const cwMeta = getPointingKeyMeta(cwCode);
  const ccwMeta = getPointingKeyMeta(ccwCode);

  if (!cwMeta || !ccwMeta || cwMeta.kind !== ccwMeta.kind) {
    return {
      cwPrefix: 'CW-MAPPED',
      ccwPrefix: 'CCW-MAPPED',
    };
  }

  if (
    cwMeta.kind === 'cursor' ||
    cwMeta.kind === 'wheel' ||
    cwMeta.kind === 'button' ||
    cwMeta.kind === 'accel'
  ) {
    return {
      cwPrefix: cwMeta.axisLabel,
      ccwPrefix: ccwMeta.axisLabel,
    };
  }

  return {
    cwPrefix: 'CW-MAPPED',
    ccwPrefix: 'CCW-MAPPED',
  };
}

function getEncoderChildElements(currentStyle, isLight) {
  if (currentStyle === 'Touchpad') {
    return [
      createElement('div', {
        key: 'touchpad-surface',
        className: 'transition-all duration-200 group-hover:brightness-105',
        style: {
          position: 'absolute',
          inset: '4px',
          borderRadius: '8px',
          background: isLight
            ? 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(226,232,240,0.95) 100%)'
            : 'linear-gradient(180deg, rgba(51,65,85,0.9) 0%, rgba(15,23,42,0.98) 100%)',
          boxShadow: isLight
            ? 'inset 0 1px 2px rgba(255,255,255,0.7), inset 0 -3px 5px rgba(0,0,0,0.12)'
            : 'inset 0 1px 2px rgba(255,255,255,0.08), inset 0 -4px 6px rgba(0,0,0,0.42)',
        },
      }),
      createElement('div', {
        key: 'touchpad-indicator-x',
        style: {
          position: 'absolute',
          width: '14px',
          height: '1.5px',
          borderRadius: '999px',
          background: isLight ? 'rgba(100,116,139,0.5)' : 'rgba(148,163,184,0.45)',
        },
      }),
      createElement('div', {
        key: 'touchpad-indicator-y',
        style: {
          position: 'absolute',
          width: '1.5px',
          height: '14px',
          borderRadius: '999px',
          background: isLight ? 'rgba(100,116,139,0.5)' : 'rgba(148,163,184,0.45)',
        },
      }),
      createElement('div', {
        key: 'touchpad-button-line',
        style: {
          position: 'absolute',
          left: '8px',
          right: '8px',
          bottom: '8px',
          height: '1px',
          background: isLight ? 'rgba(100,116,139,0.3)' : 'rgba(148,163,184,0.28)',
        },
      }),
    ];
  }

  if (currentStyle === 'Trackball') {
    return [
      createElement('div', {
        key: 'trackball-well',
        style: {
          position: 'absolute',
          inset: '5px',
          borderRadius: '12px',
          background: isLight
            ? 'radial-gradient(circle at 50% 35%, rgba(255,255,255,0.95) 0%, rgba(226,232,240,0.92) 48%, rgba(148,163,184,0.88) 100%)'
            : 'radial-gradient(circle at 50% 35%, rgba(51,65,85,0.92) 0%, rgba(15,23,42,0.96) 52%, rgba(2,6,23,1) 100%)',
          boxShadow: isLight
            ? 'inset 0 2px 5px rgba(255,255,255,0.6), inset 0 -3px 6px rgba(0,0,0,0.14)'
            : 'inset 0 2px 4px rgba(255,255,255,0.08), inset 0 -4px 8px rgba(0,0,0,0.45)',
        },
      }),
      createElement('div', {
        key: 'trackball-ring',
        style: {
          position: 'absolute',
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          border: isLight ? '2px solid rgba(148,163,184,0.88)' : '2px solid rgba(100,116,139,0.9)',
          background: isLight
            ? 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.94) 0%, rgba(226,232,240,0.8) 68%, rgba(148,163,184,0.56) 100%)'
            : 'radial-gradient(circle at 35% 35%, rgba(148,163,184,0.42) 0%, rgba(51,65,85,0.38) 72%, rgba(15,23,42,0.62) 100%)',
          boxShadow: isLight
            ? '0 2px 4px rgba(0,0,0,0.12), inset 0 1px 2px rgba(255,255,255,0.55)'
            : '0 3px 6px rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,0.08)',
        },
      }),
      createElement(
        'div',
        {
          key: 'trackball-ball',
          className:
            'transition-all duration-200 group-hover:scale-[1.04] group-hover:brightness-110',
          style: {
            position: 'relative',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: isLight
              ? 'radial-gradient(circle at 30% 30%, #e2e8f0 0%, #94a3b8 12%, #475569 28%, #1e293b 58%, #020617 100%)'
              : 'radial-gradient(circle at 30% 30%, #f8fafc 0%, #cbd5e1 16%, #94a3b8 36%, #64748b 62%, #334155 100%)',
            boxShadow: isLight
              ? '0 4px 8px rgba(15,23,42,0.28), inset 0 1px 3px rgba(255,255,255,0.42), inset -3px -4px 6px rgba(2,6,23,0.3)'
              : '0 6px 10px rgba(15,23,42,0.45), inset 0 1px 3px rgba(255,255,255,0.28), inset -3px -4px 7px rgba(15,23,42,0.35)',
          },
        },
        [
          createElement('div', {
            key: 'trackball-highlight',
            style: {
              position: 'absolute',
              left: '5px',
              top: '5px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.72)',
              filter: 'blur(0.2px)',
            },
          }),
        ]
      ),
      createElement('div', {
        key: 'trackball-socket-left',
        style: {
          position: 'absolute',
          left: '7px',
          top: '50%',
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          transform: 'translateY(-50%)',
          background: isLight ? 'rgba(100,116,139,0.72)' : 'rgba(148,163,184,0.42)',
          boxShadow: isLight
            ? 'inset 0 1px 1px rgba(255,255,255,0.4)'
            : 'inset 0 1px 1px rgba(255,255,255,0.12)',
        },
      }),
      createElement('div', {
        key: 'trackball-socket-right',
        style: {
          position: 'absolute',
          right: '7px',
          top: '50%',
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          transform: 'translateY(-50%)',
          background: isLight ? 'rgba(100,116,139,0.72)' : 'rgba(148,163,184,0.42)',
          boxShadow: isLight
            ? 'inset 0 1px 1px rgba(255,255,255,0.4)'
            : 'inset 0 1px 1px rgba(255,255,255,0.12)',
        },
      }),
      createElement('div', {
        key: 'trackball-socket-bottom',
        style: {
          position: 'absolute',
          left: '50%',
          bottom: '7px',
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          transform: 'translateX(-50%)',
          background: isLight ? 'rgba(100,116,139,0.72)' : 'rgba(148,163,184,0.42)',
          boxShadow: isLight
            ? 'inset 0 1px 1px rgba(255,255,255,0.4)'
            : 'inset 0 1px 1px rgba(255,255,255,0.12)',
        },
      }),
    ];
  }

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
        className:
          'w-[22px] h-[36px] rounded-[3px] transition-all duration-200 group-hover:scale-x-105 group-hover:brightness-110 shadow-md shadow-black/30 group-hover:shadow-blue-500/25',
        style: {
          background: wheelBg,
          boxShadow: isLight
            ? '0 2px 4px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.4)'
            : '0 3px 6px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)',
        },
      }),
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
        className:
          'w-[36px] h-[22px] rounded-[3px] transition-all duration-200 group-hover:scale-y-105 group-hover:brightness-110 shadow-md shadow-black/30 group-hover:shadow-blue-500/25',
        style: {
          background: wheelBg,
          boxShadow: isLight
            ? '0 2px 4px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.4)'
            : '0 3px 6px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)',
        },
      }),
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
        opacity: 0.8,
      },
    }),
  ];
}

export function renderEncoderKeycap({
  k,
  i,
  val,
  fullRaw,
  onMacroClick,
  encoderStyles,
  inputDeviceSettings,
  encodersSource,
  layer,
  keyStyle,
  macroAliases,
  macros = [],
  isLight,
  isAppDark,
  matrixKey,
  annotation,
  onAnnotateKey,
}) {
  const currentSetting = resolveInputDeviceSetting(
    inputDeviceSettings,
    encoderStyles,
    k.encoderIndex
  );
  const currentStyle = currentSetting.variant;
  const ccwActions = getEncoderActions(encodersSource, k.encoderIndex, layer);
  let ccwLabel = '';
  let cwLabel = '';
  let ccwCode = 'KC_NO';
  let cwCode = 'KC_NO';

  if (ccwActions) {
    ccwCode = ccwActions[0] || 'KC_NO';
    cwCode = ccwActions[1] || 'KC_NO';
    const parsedCcw = parseKeyLabel(ccwCode, ccwCode, 'Text', keyStyle, macroAliases, k.isJIS);
    const parsedCw = parseKeyLabel(cwCode, cwCode, 'Text', keyStyle, macroAliases, k.isJIS);
    ccwLabel = parsedCcw.displayText;
    cwLabel = parsedCw.displayText;
  }

  const parsedPush = parseKeyLabel(val, k.id, 'Text', keyStyle, macroAliases, k.isJIS);
  const pushText = parsedPush.displayText;
  const { cwPrefix, ccwPrefix } = getTrackballTooltipPrefixes(cwCode, ccwCode);
  const tooltipText = buildEncoderTooltip({
    encoderIndex: k.encoderIndex,
    pushText,
    pushCode: val,
    macros,
    keyStyle,
    currentStyle,
    ccwActions,
    ccwLabel,
    cwLabel,
    ccwCode,
    cwCode,
    trackballCwPrefix: cwPrefix,
    trackballCcwPrefix: ccwPrefix,
  });

  const displayRaw = buildDisplayRaw(fullRaw, val);
  const containerClass =
    currentStyle === 'VerticalWheel' ||
    currentStyle === 'HorizontalWheel' ||
    currentStyle === 'Trackball'
      ? 'encoder-wheel-container group'
      : 'key-cap encoder-knob group';

  return createElement(
    'div',
    {
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
      onContextMenu: (e) => {
        if (onAnnotateKey) {
          e.preventDefault();
          onAnnotateKey(matrixKey);
        }
      },
      style: getKeycapFrameStyle({
        k,
        isLayerKey: false,
        encoderStyles,
        inputDeviceSettings,
        isLight,
        isAppDark,
      }),
    },
    [
      ...getEncoderChildElements(currentStyle, isLight),
      annotation && (annotation.customText || annotation.description) &&
        createElement('div', {
          key: 'annotation-dot',
          style: {
            position: 'absolute',
            right: '4px',
            top: '4px',
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            backgroundColor: '#60a5fa',
            zIndex: 50,
            pointerEvents: 'none',
          },
        }),
    ]
  );
}
