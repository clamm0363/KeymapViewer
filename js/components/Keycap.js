const { createElement, memo } = React;

import { parseKeyLabel } from '../utils/labelParser.js';
import { buildKeyInspectorData } from '../utils/keyInspector.js';
import { getKeycapFrameStyle, getModColor } from './keycapStyles.js';
import {
  buildLayerDisplayModel,
  buildModDisplayModel,
  buildDisplayRaw,
  buildStandardDisplayModel,
  getIconRenderState,
  narrowSlash,
  normalizeTargetIconKey,
  shortenLabel,
} from './keycapIconUtils.js';
import { buildStandardHoverInfo } from './keycapTooltip.js';
import { renderEncoderKeycap } from './keycapEncoder.js';
import { renderLayerKeycap, renderModKeycap, renderStandardKeycap } from './keycapSections.js';
import { perfCounter, perfEnd, perfStart } from '../utils/perfDebug.js';

function KeycapInner({
  k,
  val,
  i,
  displayMode,
  keyStyle,
  macroAliases,
  encoderStyles,
  inputDeviceSettings,
  layer,
  design,
  externalMap,
  isLight,
  isAppDark,
  matrixKey,
  annotation,
  onEditKey,
  onKeyHover,
  onKeyHoverLeave,
}) {
  perfCounter('Keycap.render');
  const totalStartedAt = perfStart();
  const parseStartedAt = perfStart();
  const parsed = parseKeyLabel(val, k.id, displayMode, keyStyle, macroAliases, k.isJIS);
  let {
    fullRaw,
    displayText,
    isFluentIcon,
    isLayerKey,
    layerType,
    layerNum,
    layerNum2,
    tapLabel,
    tapIsFluent,
    isModKey,
    modType,
    modLabel,
    modKeys,
    baseLabel,
    baseIsFluent,
  } = parsed;

  displayText = narrowSlash(displayText);
  tapLabel = narrowSlash(tapLabel);
  baseLabel = narrowSlash(baseLabel);
  modLabel = narrowSlash(modLabel);

  const displayRawForRGB = buildDisplayRaw(fullRaw, val);
  const targetIconKey = normalizeTargetIconKey(displayRawForRGB);
  const iconRenderState = getIconRenderState({
    displayRaw: displayRawForRGB,
    targetIconKey,
    displayMode,
    keyStyle,
    isModKey,
    modType,
  });
  const {
    rgbLabel,
    actuallyShowingSvg,
    isMagicFluent,
    macroLabel,
    isWirelessKey,
    wirelessLabel,
    isMouseKey,
    mouseLabel,
    webLabel,
    isUtilityFluent,
    utilityLabel,
  } = iconRenderState;

  const textModeParsed =
    displayMode === 'Text'
      ? parsed
      : parseKeyLabel(val, k.id, 'Text', keyStyle, macroAliases, k.isJIS);
  let textFallback = narrowSlash(textModeParsed.displayText);
  const is1u = (k.w || 56) / 56 < 1.25;
  if (is1u) {
    displayText = shortenLabel(displayText);
    tapLabel = shortenLabel(tapLabel);
    baseLabel = shortenLabel(baseLabel);
    textFallback = shortenLabel(textFallback);
  }

  const isFluentCenter = isFluentIcon || (isModKey && baseIsFluent);
  const centerText = isModKey && modType !== 'base' ? baseLabel : displayText;
  const magicLabel = isMagicFluent ? narrowSlash(textModeParsed.displayText) : '';
  perfEnd('Keycap.parseKeyLabel', parseStartedAt, {
    isEncoder: !!k.isEncoder,
  });

  if (k.isEncoder) {
    perfEnd('Keycap.total', totalStartedAt, { kind: 'encoder' });
    const encodersSource = (externalMap && externalMap.encoders) || (design && design.encoders);
    return renderEncoderKeycap({
      k,
      i,
      val,
      fullRaw,
      encoderStyles,
      inputDeviceSettings,
      encodersSource,
      layer,
      keyStyle,
      macroAliases,
      macros: (externalMap && externalMap.macros) || [],
      isLight,
      isAppDark,
      matrixKey,
      annotation,
      onEditKey,
      onKeyHover,
      onKeyHoverLeave,
    });
  }

  let finalDisplayText = centerText;
  let manualWrap = false;

  const hasSlash = /[\s\u2009\u200a]*\/[\s\u2009\u200a]*/.test(centerText);
  if (centerText.length > 5 && (centerText.includes('_') || centerText.includes('-') || hasSlash)) {
    if (hasSlash) {
      const parts = centerText.split(/[\s\u2009\u200a]*\/[\s\u2009\u200a]*/);
      finalDisplayText = parts[0] + '\n' + parts[1];
      manualWrap = true;
    } else {
      const splitIdx = Math.max(centerText.lastIndexOf('_'), centerText.lastIndexOf('-'));
      if (splitIdx > 1 && splitIdx < centerText.length - 2) {
        finalDisplayText =
          centerText.substring(0, splitIdx) + '\n' + centerText.substring(splitIdx);
        manualWrap = true;
      }
    }
  }

  const kWidth = k.w - 12;
  const availableWidth = kWidth - 2;

  let visualWeightForScale = centerText.length;
  if (manualWrap) {
    const lines = finalDisplayText.split('\n');
    visualWeightForScale = Math.max(...lines.map((l) => l.length));
  }
  if (isFluentCenter) {
    visualWeightForScale = 1.2;
  } else if (isModKey && modType !== 'base') {
    visualWeightForScale += 0.5;
  }

  const charWidthMultiplier = 10.5;
  const estimatedPxWidth = visualWeightForScale * charWidthMultiplier;
  let targetScale = 1.0;
  let canWrap = manualWrap;

  if (estimatedPxWidth > availableWidth) {
    if (centerText.length <= 6) {
      targetScale = 1.0;
    } else {
      targetScale = availableWidth / estimatedPxWidth;
      if (!manualWrap && targetScale < 0.7 && centerText.length > 6) {
        canWrap = true;
        targetScale = Math.max(0.75, targetScale * 1.2);
      }
    }
  }

  const minScaleLimit = centerText.length >= 7 ? 0.4 : centerText.length >= 5 ? 0.5 : 0.6;
  targetScale = Math.max(minScaleLimit, Math.min(1.1, targetScale));
  if (manualWrap) targetScale = Math.min(0.9, targetScale);

  const displayRaw = displayRawForRGB;

  if (actuallyShowingSvg) {
    targetScale = 1.11;
  }

  const standardDisplayModel = buildStandardDisplayModel({
    displayMode,
    displayRaw,
    displayRawForRGB,
    targetIconKey,
    finalDisplayText,
    isFluentIcon,
    manualWrap,
    canWrap,
    targetScale,
    kWidth: (k.w || 56) / 56,
    iconState: {
      ...iconRenderState,
      isMagicFluent,
      rgbLabel,
      wirelessLabel,
      webLabel,
      mouseLabel,
      macroLabel,
      magicLabel,
      isUtilityFluent,
      utilityLabel,
    },
  });

  const modDisplayModel = buildModDisplayModel({
    modType,
    finalDisplayText,
    displayMode,
    kWidth: (k.w || 56) / 56,
    targetScale,
    targetIconKey,
    modKeys,
    canWrap,
    baseLabel,
    baseIsFluent,
    keyStyle,
    modLabel,
    iconState: {
      actuallyShowingSvg,
      isWirelessKey,
      isMouseKey,
    },
  });

  const layerDisplayModel = buildLayerDisplayModel({
    layerNum2,
    layerType,
    layerNum,
    tapIsFluent,
    tapLabel,
    kWidth: (k.w || 56) / 56,
    targetScale,
  });

  const activeDisplayModel = isLayerKey
    ? layerDisplayModel
    : isModKey
      ? modDisplayModel
      : standardDisplayModel;
  const inspectorData = buildKeyInspectorData({
    code: val || fullRaw,
    keyStyle,
    displayRaw,
    targetIconKey,
    parsed: {
      displayText,
      modLabel,
      baseLabel,
      textFallback,
    },
    iconRenderState,
    displayModel: activeDisplayModel,
    macros: (externalMap && externalMap.macros) || [],
  });
  const hoverContentInfo = buildStandardHoverInfo(
    val || fullRaw,
    keyStyle,
    (externalMap && externalMap.macros) || [],
    inspectorData,
    annotation
  );
  perfEnd('Keycap.total', totalStartedAt, {
    kind: isLayerKey ? 'layer' : isModKey ? 'mod' : 'standard',
  });

  const jisSvg =
    k.isJIS &&
    (() => {
      const W = k.w - 6;
      const H = k.h - 6;
      const N = 14;
      const H2 = 50;
      const R = 6;
      const O = 1.2;
      const pathD = `M ${R},${O} L ${W - R},${O} A ${R},${R} 0 0 1 ${W - O},${R} L ${W - O},${H - R} A ${R},${R} 0 0 1 ${W - R},${H - O} L ${N + R},${H - O} A ${R},${R} 0 0 1 ${N + O},${H - R} L ${N + O},${H2 + R} A ${R},${R} 0 0 0 ${N - R + O},${H2} L ${R},${H2} A ${R},${R} 0 0 1 ${O},${H2 - R} L ${O},${R} A ${R},${R} 0 0 1 ${R},${O} Z`;
      const strokeColor = isLight
        ? isAppDark
          ? '#94a3b8'
          : '#cbd5e1'
        : isAppDark
          ? '#475569'
          : '#334155';
      const fillColor = isLight ? '#ffffff' : isAppDark ? 'rgba(15, 23, 42, 0.6)' : '#1e293b';
      const dropShadow = isLight
        ? 'drop-shadow(0 4px 6px rgb(0 0 0 / 0.08))'
        : 'drop-shadow(0 20px 25px rgb(0 0 0 / 0.15))';
      return createElement(
        'svg',
        {
          key: 'jis-enter-svg',
          className: 'jis-enter-svg',
          style: {
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            filter: dropShadow,
            overflow: 'visible',
            zIndex: 1,
          },
          shapeRendering: 'geometricPrecision',
        },
        createElement('path', {
          key: 'jis-enter-path',
          d: pathD,
          className: 'jis-enter-path',
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: 2.4,
          style: { transition: 'all 0.075s ease' },
        })
      );
    })();

  return createElement(
    'div',
    {
      key: i,
      className: `key-cap group${k.isJIS ? ' jis-key' : ''}`,
      'data-key-raw': displayRaw,
      onClick: (e) => {
        const macroMatch = fullRaw.match(/MACRO\((\d+)\)/);
        if (onEditKey) {
          e.stopPropagation();
          onEditKey({
            matrixKey,
            macroId: macroMatch ? parseInt(macroMatch[1], 10) : null,
          });
        }
      },
      onMouseEnter: (e) => {
        if (onKeyHover) {
          onKeyHover(e, hoverContentInfo);
        }
      },
      onMouseLeave: () => {
        if (onKeyHoverLeave) {
          onKeyHoverLeave();
        }
      },
      style: getKeycapFrameStyle({
        k,
        isLayerKey: isLayerKey || isModKey,
        encoderStyles,
        inputDeviceSettings,
        isLight,
        isAppDark,
      }),
    },
    jisSvg,
    isModKey &&
      modType === 'base' &&
      createElement('div', {
        className: 'mod-accent-bar',
        style: {
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '3.5px',
          backgroundColor: getModColor(modKeys[0], isLight, isAppDark),
          zIndex: 20,
        },
      }),

    isLayerKey
      ? renderLayerKeycap({
          model: layerDisplayModel,
          isLight,
          isAppDark,
        })
      : isModKey
        ? renderModKeycap({
            model: modDisplayModel,
            isLight,
            isAppDark,
          })
        : renderStandardKeycap({
            k,
            model: standardDisplayModel,
            isLight,
          }),

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
      })
  );
}

export const Keycap = memo(KeycapInner);
