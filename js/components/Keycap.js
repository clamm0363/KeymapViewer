const { createElement, memo } = React;

import { isSVGAvailable } from '../svg-icons.js';
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
  k: keyLayout,
  val: keycode,
  i: keyIndex,
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
  const parsedLabel = parseKeyLabel(
    keycode,
    keyLayout.id,
    displayMode,
    keyStyle,
    macroAliases,
    keyLayout.isJIS
  );
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
  } = parsedLabel;

  displayText = narrowSlash(displayText);
  tapLabel = narrowSlash(tapLabel);
  baseLabel = narrowSlash(baseLabel);
  modLabel = narrowSlash(modLabel);

  const displayRawForRGB = buildDisplayRaw(fullRaw, keycode);
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

  const textModeLabel =
    displayMode === 'Text'
      ? parsedLabel
      : parseKeyLabel(keycode, keyLayout.id, 'Text', keyStyle, macroAliases, keyLayout.isJIS);
  let textFallback = narrowSlash(textModeLabel.displayText);
  const isCompactKeyWidth = (keyLayout.w || 56) / 56 < 1.25;
  if (isCompactKeyWidth) {
    displayText = shortenLabel(displayText);
    tapLabel = shortenLabel(tapLabel);
    baseLabel = shortenLabel(baseLabel);
    textFallback = shortenLabel(textFallback);
  }

  const isFluentCenter = isFluentIcon || (isModKey && baseIsFluent);
  const centerText = isModKey && modType !== 'base' ? baseLabel : displayText;
  const magicLabel = isMagicFluent ? narrowSlash(textModeLabel.displayText) : '';
  perfEnd('Keycap.parseKeyLabel', parseStartedAt, {
    isEncoder: !!keyLayout.isEncoder,
  });

  if (keyLayout.isEncoder) {
    perfEnd('Keycap.total', totalStartedAt, { kind: 'encoder' });
    const encoderDefinitions = (externalMap && externalMap.encoders) || (design && design.encoders);
    return renderEncoderKeycap({
      k: keyLayout,
      i: keyIndex,
      val: keycode,
      fullRaw,
      encoderStyles,
      inputDeviceSettings,
      encodersSource: encoderDefinitions,
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

  const keyInnerWidth = keyLayout.w - 12;
  const availableTextWidth = keyInnerWidth - 2;

  let scaleTextWeight = centerText.length;
  if (manualWrap) {
    const lines = finalDisplayText.split('\n');
    scaleTextWeight = Math.max(...lines.map((line) => line.length));
  }
  if (isFluentCenter) {
    scaleTextWeight = 1.2;
  } else if (isModKey && modType !== 'base') {
    scaleTextWeight += 0.5;
  }

  const charWidthMultiplier = 10.5;
  const estimatedTextWidthPx = scaleTextWeight * charWidthMultiplier;
  let computedTextScale = 1.0;
  let allowsAutoWrap = manualWrap;

  if (estimatedTextWidthPx > availableTextWidth) {
    if (centerText.length <= 6) {
      computedTextScale = 1.0;
    } else {
      computedTextScale = availableTextWidth / estimatedTextWidthPx;
      if (!manualWrap && computedTextScale < 0.7 && centerText.length > 6) {
        allowsAutoWrap = true;
        computedTextScale = Math.max(0.75, computedTextScale * 1.2);
      }
    }
  }

  const minScaleLimit = centerText.length >= 7 ? 0.4 : centerText.length >= 5 ? 0.5 : 0.6;
  computedTextScale = Math.max(minScaleLimit, Math.min(1.1, computedTextScale));
  if (manualWrap) computedTextScale = Math.min(0.9, computedTextScale);

  const displayRaw = displayRawForRGB;

  if (actuallyShowingSvg) {
    computedTextScale = 1.11;
  }

  const standardDisplayModel = buildStandardDisplayModel({
    displayMode,
    displayRaw,
    displayRawForRGB,
    targetIconKey,
    finalDisplayText,
    isFluentIcon,
    manualWrap,
    canWrap: allowsAutoWrap,
    targetScale: computedTextScale,
    kWidth: (keyLayout.w || 56) / 56,
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
  const annotationIconKey = normalizeTargetIconKey(annotation?.iconKey || '');
  const shouldOverrideWithAnnotationIcon =
    !!annotationIconKey && isSVGAvailable(annotationIconKey);
  const resolvedStandardDisplayModel = shouldOverrideWithAnnotationIcon
    ? {
        ...standardDisplayModel,
        variant: 'center-svg',
        resolvedIconKey: annotationIconKey,
        centerText: '',
        isFluentCenter: true,
        manualWrap: false,
        canWrap: false,
        targetScale: 1.11,
        textScalePreset: 1,
        bottomLabel: null,
        bottomLabelKind: null,
        bottomCaption: null,
      }
    : standardDisplayModel;

  const modDisplayModel = buildModDisplayModel({
    modType,
    finalDisplayText,
    displayMode,
    kWidth: (keyLayout.w || 56) / 56,
    targetScale: computedTextScale,
    targetIconKey,
    modKeys,
    canWrap: allowsAutoWrap,
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
    kWidth: (keyLayout.w || 56) / 56,
    targetScale: computedTextScale,
  });

  const resolvedDisplayModel = isLayerKey
    ? shouldOverrideWithAnnotationIcon
      ? resolvedStandardDisplayModel
      : layerDisplayModel
    : isModKey
      ? shouldOverrideWithAnnotationIcon
        ? resolvedStandardDisplayModel
        : modDisplayModel
      : resolvedStandardDisplayModel;
  const inspectorData = buildKeyInspectorData({
    code: keycode || fullRaw,
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
    displayModel: resolvedDisplayModel,
    macros: (externalMap && externalMap.macros) || [],
  });
  const hoverTooltipInfo = buildStandardHoverInfo(
    keycode || fullRaw,
    keyStyle,
    (externalMap && externalMap.macros) || [],
    inspectorData,
    annotation
  );
  perfEnd('Keycap.total', totalStartedAt, {
    kind: isLayerKey ? 'layer' : isModKey ? 'mod' : 'standard',
  });

  const jisSvg =
    keyLayout.isJIS &&
    (() => {
      const W = keyLayout.w - 6;
      const H = keyLayout.h - 6;
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
      key: keyIndex,
      className: `key-cap group${keyLayout.isJIS ? ' jis-key' : ''}`,
      'data-key-raw': displayRaw,
      onClick: (e) => {
        const macroReferenceMatch = fullRaw.match(/MACRO\((\d+)\)/);
        if (onEditKey) {
          e.stopPropagation();
          onEditKey({
            matrixKey,
            macroId: macroReferenceMatch ? parseInt(macroReferenceMatch[1], 10) : null,
          });
        }
      },
      onMouseEnter: (e) => {
        if (onKeyHover) {
          onKeyHover(e, hoverTooltipInfo);
        }
      },
      onMouseLeave: () => {
        if (onKeyHoverLeave) {
          onKeyHoverLeave();
        }
      },
      style: getKeycapFrameStyle({
        k: keyLayout,
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

    shouldOverrideWithAnnotationIcon
      ? renderStandardKeycap({
          k: keyLayout,
          model: resolvedStandardDisplayModel,
          isLight,
        })
      : isLayerKey
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
            k: keyLayout,
            model: resolvedStandardDisplayModel,
            isLight,
          }),

    annotation && (annotation.customText || annotation.description || annotation.iconKey) &&
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
