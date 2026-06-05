const { createElement, memo, useEffect, useMemo, useRef, useState } = React;

import { findSplitX } from '../utils/helpers.js';
import { Keycap } from './Keycap.js';
import { perfCounter, perfEnd, perfStart } from '../utils/perfDebug.js';

function areScaleMetricsEqual(prevMetrics, nextMetrics) {
  if (!prevMetrics || !nextMetrics) return false;
  return (
    prevMetrics.autoFitScale === nextMetrics.autoFitScale &&
    prevMetrics.finalScale === nextMetrics.finalScale &&
    prevMetrics.maxWidth === nextMetrics.maxWidth &&
    prevMetrics.maxHeight === nextMetrics.maxHeight &&
    prevMetrics.containerWidth === nextMetrics.containerWidth
  );
}

function KeyboardInner({
  design,
  layer = 0,
  externalMap = null,
  displayMode = 'Fluent',
  theme = 'System',
  appTheme = 'dark',
  macroAliases = {},
  forcedScale = null,
  userScale = 1,
  keyStyle = 'Windows',
  separation = 'DISABLE',
  encoderStyles = {},
  inputDeviceSettings = {},
  layoutOptions = {},
  onScaleMetricsChange = null,
  keyAnnotations = {},
  _showCallouts = false,
  onEditKey = null,
  onKeysChange = null,
  onKeyHover = null,
  onKeyHoverLeave = null,
}) {
  perfCounter('Keyboard.render');
  const containerRef = useRef(null);
  const lastReportedScaleMetricsRef = useRef(null);
  const [autoFitScale, setAutoFitScale] = useState(1);

  const isLight =
    theme === 'Light' ||
    (theme === 'System' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: light)').matches);
  const isAppDark =
    appTheme === 'dark' ||
    (appTheme === 'System' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const isSeparationEnabled = separation === 'ENABLE';
  const splitBoundaryX = useMemo(() => {
    if (!isSeparationEnabled) return null;
    return findSplitX(design);
  }, [design, isSeparationEnabled]);

  const selectedLayoutOptions = useMemo(() => {
    return layoutOptions || {};
  }, [layoutOptions]);

  const layoutKeys = useMemo(() => {
    const startedAt = perfStart();
    if (!design || !design.layouts || !design.layouts.keymap) return [];
    const positionedKeys = [];
    const keyUnitSize = 56;
    let cursorXUnits = 0,
      cursorYUnits = 0,
      pendingWidthUnits = 1,
      pendingHeightUnits = 1;
    let isJISKey = false;
    design.layouts.keymap.forEach((row) => {
      cursorXUnits = 0;
      row.forEach((item) => {
        if (typeof item === 'string') {
          const parts = item.split('\n');
          const matrixMatch = parts[0].match(/(\d+),(\d+)/);
          const encoderMatch = parts.find((p) => /^e\d+$/.test(p.trim()));
          const isEncoder = !!encoderMatch;
          const encoderIndex = isEncoder ? parseInt(encoderMatch.replace('e', ''), 10) : null;

          let layoutOptionIndex = null;
          let requiredOptionValue = null;
          for (let partIndex = 1; partIndex < parts.length; partIndex++) {
            const part = parts[partIndex].trim();
            if (/^\d+,\d+$/.test(part)) {
              const [optionIndex, optionValue] = part.split(',').map((num) => parseInt(num, 10));
              layoutOptionIndex = optionIndex;
              requiredOptionValue = optionValue;
              break;
            }
          }

          let shouldRenderKey = true;
          if (layoutOptionIndex !== null && layoutOptionIndex !== undefined) {
            // layoutOptionIndex は parseInt 済みの数値。Object.hasOwn で存在確認後にアクセスする
            const optionIndex = Number(layoutOptionIndex);
            const selectedOptionValue = Object.hasOwn(selectedLayoutOptions, optionIndex)
              ? selectedLayoutOptions[optionIndex]
              : 0;
            if (selectedOptionValue !== requiredOptionValue) {
              shouldRenderKey = false;
            }
          }

          if (shouldRenderKey) {
            positionedKeys.push({
              id: item,
              matrix: matrixMatch ? [parseInt(matrixMatch[1]), parseInt(matrixMatch[2])] : null,
              x: cursorXUnits * keyUnitSize,
              y: cursorYUnits * keyUnitSize,
              w: pendingWidthUnits * keyUnitSize,
              h: pendingHeightUnits * keyUnitSize,
              isJIS: isJISKey,
              isEncoder,
              encoderIndex,
              optionIdx: layoutOptionIndex,
              optionVal: requiredOptionValue,
            });
          }
          cursorXUnits += pendingWidthUnits;
          pendingWidthUnits = 1;
          pendingHeightUnits = 1;
          isJISKey = false;
        } else {
          if (item.x !== undefined) cursorXUnits += item.x;
          if (item.y !== undefined) cursorYUnits += item.y;
          if (item.w !== undefined) pendingWidthUnits = item.w;
          if (item.h !== undefined) pendingHeightUnits = item.h;
          if (item.isJIS !== undefined) isJISKey = item.isJIS;
        }
      });
      cursorYUnits++;
    });

    if (isSeparationEnabled && splitBoundaryX !== null) {
      const leftClusterKeys = positionedKeys.filter((key) => key.x + key.w / 2 < splitBoundaryX);
      const rightClusterKeys = positionedKeys.filter((key) => key.x + key.w / 2 >= splitBoundaryX);

      if (leftClusterKeys.length > 0 && rightClusterKeys.length > 0) {
        const leftClusterMaxX = Math.max(...leftClusterKeys.map((key) => key.x + key.w));
        const rightClusterMinX = Math.min(...rightClusterKeys.map((key) => key.x));

        const originalGap = rightClusterMinX - leftClusterMaxX;
        const targetGap = keyUnitSize * 1.5;
        const rightClusterOffsetX = targetGap - originalGap;

        rightClusterKeys.forEach((key) => {
          key.x += rightClusterOffsetX;
        });
      }
    }

    perfEnd('Keyboard.computeKeys', startedAt, {
      keyCount: positionedKeys.length,
      separation: isSeparationEnabled,
    });
    return positionedKeys;
  }, [design, isSeparationEnabled, splitBoundaryX, selectedLayoutOptions]);

  const maxWidth = useMemo(
    () => (layoutKeys.length ? Math.max(...layoutKeys.map((key) => key.x + key.w), 0) + 40 : 0),
    [layoutKeys]
  );
  const maxHeight = useMemo(
    () => (layoutKeys.length ? Math.max(...layoutKeys.map((key) => key.y + key.h), 0) + 40 : 0),
    [layoutKeys]
  );

  useEffect(() => {
    if (typeof onKeysChange === 'function') {
      onKeysChange(layoutKeys);
    }
  }, [layoutKeys, onKeysChange]);

  useEffect(() => {
    if (forcedScale !== null) {
      setAutoFitScale(1);
      return;
    }

    if (!containerRef.current || maxWidth === 0) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const containerWidth = entry.contentRect.width;
        const available = Math.max(0, containerWidth - 48);
        let nextScale = available / maxWidth;
        if (nextScale > 1) nextScale = 1;
        setAutoFitScale(Math.max(0.35, nextScale));
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [maxWidth, forcedScale]);

  const codes = useMemo(() => {
    // layer は数値インデックス。Number() で明示的に数値化してからアクセスする
    const layerIdx = Number(layer);
    const layerSource =
      (externalMap && externalMap.layers && externalMap.layers[layerIdx]) ||
      (design && design.layers && design.layers[layerIdx]);
    if (layerSource) {
      const startedAt = perfStart();
      const next = {};
      const cols = (design && design.matrix && design.matrix.cols) || 16;
      // キーは Math.floor / % による純粋な計算値であり、ユーザー入力ではない
      layerSource.forEach((v, i) => (next[`${Math.floor(i / cols)},${i % cols}`] = v));
      perfEnd('Keyboard.computeCodes', startedAt, {
        entries: layerSource.length,
      });
      return next;
    } else {
      return {};
    }
  }, [design, layer, externalMap]);

  const normalizedUserScale =
    Number.isFinite(Number(userScale)) && Number(userScale) > 0 ? Number(userScale) : 1;
  const baseScale = forcedScale !== null ? forcedScale : autoFitScale;
  const finalScale = baseScale * normalizedUserScale;

  useEffect(() => {
    if (typeof onScaleMetricsChange !== 'function') return;

    const nextMetrics = {
      autoFitScale,
      finalScale,
      maxWidth,
      maxHeight,
      containerWidth: containerRef.current?.getBoundingClientRect().width ?? 0,
    };
    if (areScaleMetricsEqual(lastReportedScaleMetricsRef.current, nextMetrics)) return;

    lastReportedScaleMetricsRef.current = nextMetrics;
    perfCounter('Keyboard.onScaleMetricsChange');
    onScaleMetricsChange(nextMetrics);
  }, [autoFitScale, finalScale, maxWidth, maxHeight, onScaleMetricsChange]);

  if (layoutKeys.length === 0) return null;

  const leftCaseStyle = useMemo(() => {
    if (!isSeparationEnabled || splitBoundaryX === null) return null;
    const leftClusterKeys = layoutKeys.filter((key) => key.x + key.w / 2 < splitBoundaryX);
    if (leftClusterKeys.length === 0) return null;

    const minX = Math.min(...leftClusterKeys.map((key) => key.x));
    const maxX = Math.max(...leftClusterKeys.map((key) => key.x + key.w));
    const minY = Math.min(...leftClusterKeys.map((key) => key.y));
    const maxY = Math.max(...leftClusterKeys.map((key) => key.y + key.h));

    const paddingOffset = 20;

    let border, boxShadow;

    if (isLight && isAppDark) {
      border = '2px solid rgba(226, 232, 240, 0.92)';
      boxShadow =
        '0 16px 36px -16px rgba(2, 8, 23, 0.38), inset 0 2px 4px rgba(255,255,255,0.95), inset 0 -8px 18px rgba(100,116,139,0.22)';
    } else if (isLight) {
      border = '2px solid rgba(203, 213, 225, 0.5)';
      boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.05)';
    } else if (isAppDark) {
      border = '2px solid rgba(100, 116, 139, 0.4)';
      boxShadow = 'inset 0 2px 20px rgba(0,0,0,0.4)';
    } else {
      border = '2px solid rgba(148, 163, 184, 0.8)';
      boxShadow =
        '0 10px 30px -10px rgba(15,23,42,0.18), inset 0 2px 4px rgba(255,255,255,0.55), inset 0 -2px 4px rgba(0,0,0,0.15)';
    }

    return {
      position: 'absolute',
      left: `${minX + paddingOffset - 20}px`,
      top: `${minY + paddingOffset - 20}px`,
      width: `${maxX - minX + 40}px`,
      height: `${maxY - minY + 40}px`,
      borderRadius: '2rem',
      overflow: 'hidden',
      zIndex: 0,
      border,
      boxShadow,
    };
  }, [layoutKeys, isSeparationEnabled, splitBoundaryX, isLight, isAppDark]);

  const rightCaseStyle = useMemo(() => {
    if (!isSeparationEnabled || splitBoundaryX === null) return null;
    const rightClusterKeys = layoutKeys.filter((key) => key.x + key.w / 2 >= splitBoundaryX);
    if (rightClusterKeys.length === 0) return null;

    const minX = Math.min(...rightClusterKeys.map((key) => key.x));
    const maxX = Math.max(...rightClusterKeys.map((key) => key.x + key.w));
    const minY = Math.min(...rightClusterKeys.map((key) => key.y));
    const maxY = Math.max(...rightClusterKeys.map((key) => key.y + key.h));

    const paddingOffset = 20;

    let border, boxShadow;

    if (isLight) {
      border = '2px solid rgba(203, 213, 225, 0.5)';
      boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.05)';
    } else if (isAppDark) {
      border = '2px solid rgba(100, 116, 139, 0.4)';
      boxShadow = 'inset 0 2px 20px rgba(0,0,0,0.4)';
    } else {
      border = '2px solid rgba(148, 163, 184, 0.8)';
      boxShadow =
        '0 10px 30px -10px rgba(15,23,42,0.18), inset 0 2px 4px rgba(255,255,255,0.55), inset 0 -2px 4px rgba(0,0,0,0.15)';
    }

    return {
      position: 'absolute',
      left: `${minX + paddingOffset - 20}px`,
      top: `${minY + paddingOffset - 20}px`,
      width: `${maxX - minX + 40}px`,
      height: `${maxY - minY + 40}px`,
      borderRadius: '2rem',
      overflow: 'hidden',
      zIndex: 0,
      border,
      boxShadow,
    };
  }, [layoutKeys, isSeparationEnabled, splitBoundaryX, isLight, isAppDark]);

  const getKbdContainerClass = () => {
    return 'kbd-container relative transition-all duration-200';
  };

  const getKbdContainerStyle = () => {
    const baseStyle = {
      width: '100%',
      height: '100%',
      transform: 'none',
      borderRadius: '2rem',
      overflow: 'hidden',
      position: 'relative',
    };

    if (isSeparationEnabled && splitBoundaryX !== null) {
      return {
        ...baseStyle,
        border: 'none',
        background: 'transparent',
        boxShadow: 'none',
      };
    }

    let border, boxShadow;

    if (isLight) {
      border = '2px solid rgba(203, 213, 225, 0.5)';
      boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.05)';
    } else if (isAppDark) {
      border = '2px solid rgba(100, 116, 139, 0.4)';
      boxShadow = 'inset 0 2px 20px rgba(0,0,0,0.4)';
    } else {
      border = '2px solid rgba(148, 163, 184, 0.8)';
      boxShadow =
        '0 10px 30px -10px rgba(15,23,42,0.18), inset 0 2px 4px rgba(255,255,255,0.55), inset 0 -2px 4px rgba(0,0,0,0.15)';
    }

    return {
      ...baseStyle,
      border,
      boxShadow,
    };
  };

  const getKbdBackgroundStyle = () => {
    if (isSeparationEnabled && splitBoundaryX !== null) return null;

    let background;
    if (isLight && isAppDark) {
      background =
        'linear-gradient(145deg, rgba(248,250,252,0.98) 0%, rgba(224,231,239,0.96) 26%, rgba(191,201,215,0.98) 56%, rgba(232,238,245,0.97) 100%)';
    } else if (isLight) {
      background = 'rgba(226, 232, 240, 0.8)';
    } else if (isAppDark) {
      background =
        'linear-gradient(135deg, rgba(148, 163, 184, 0.4) 0%, rgba(71, 85, 105, 0.4) 100%)';
    } else {
      background = 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 50%, #64748b 100%)';
    }

    return {
      position: 'absolute',
      top: '-3px',
      left: '-3px',
      width: 'calc(100% + 6px)',
      height: 'calc(100% + 6px)',
      background,
      zIndex: 0,
      pointerEvents: 'none',
    };
  };

  const getCaseBgFillStyle = () => {
    let background;
    if (isLight && isAppDark) {
      background =
        'linear-gradient(145deg, rgba(248,250,252,0.98) 0%, rgba(224,231,239,0.96) 26%, rgba(191,201,215,0.98) 56%, rgba(232,238,245,0.97) 100%)';
    } else if (isLight) {
      background = 'rgba(226, 232, 240, 0.8)';
    } else if (isAppDark) {
      background =
        'linear-gradient(135deg, rgba(148, 163, 184, 0.4) 0%, rgba(71, 85, 105, 0.4) 100%)';
    } else {
      background = 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 50%, #64748b 100%)';
    }
    return {
      position: 'absolute',
      top: '-3px',
      left: '-3px',
      width: 'calc(100% + 6px)',
      height: 'calc(100% + 6px)',
      background,
      pointerEvents: 'none',
    };
  };

  return createElement(
    'div',
    {
      ref: containerRef,
      className:
        'keyboard-container relative overflow-hidden flex items-center justify-center py-1 px-6',
      style: { width: '100%', height: `${maxHeight * finalScale + 8}px` },
      onMouseLeave: onKeyHoverLeave,
    },
    createElement(
      'div',
      {
        className: 'keyboard-inner relative',
        style: {
          width: `${maxWidth}px`,
          height: `${maxHeight}px`,
          transform: finalScale === 1 ? 'none' : `scale(${finalScale})`,
          transformOrigin: 'center center',
          flexShrink: 0,
        },
      },
      createElement(
        'div',
        {
          className: getKbdContainerClass(),
          style: getKbdContainerStyle(),
        },
        [
          getKbdBackgroundStyle() &&
            createElement('div', {
              key: 'kbd-bg-fill',
              style: getKbdBackgroundStyle(),
            }),
          isSeparationEnabled &&
            splitBoundaryX !== null &&
            leftCaseStyle &&
            createElement(
              'div',
              {
                key: 'left-case',
                style: leftCaseStyle,
                className: 'transition-all duration-200',
              },
              createElement('div', { style: getCaseBgFillStyle() })
            ),
          isSeparationEnabled &&
            splitBoundaryX !== null &&
            rightCaseStyle &&
            createElement(
              'div',
              {
                key: 'right-case',
                style: rightCaseStyle,
                className: 'transition-all duration-200',
              },
              createElement('div', { style: getCaseBgFillStyle() })
            ),
          ...layoutKeys.map((key, keyIndex) => {
            const matrixKey = key.matrix ? `${key.matrix[0]},${key.matrix[1]}` : key.id;
            const keycode = key.matrix ? codes[matrixKey] : null;

            return createElement(Keycap, {
              key: `${matrixKey}:${key.x}:${key.y}:${key.w}:${key.h}`,
              k: key,
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
              annotation: keyAnnotations[matrixKey] || null,
              onEditKey,
              onKeyHover,
              onKeyHoverLeave,
            });
          }),
        ]
      )
    )
  );
}

export const Keyboard = memo(KeyboardInner);
