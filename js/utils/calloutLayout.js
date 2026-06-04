export const CALLOUT_MAX_WIDTH = 300;
export const CALLOUT_MIN_WIDTH = 160;
export const CALLOUT_LINE_LENGTH = 48;
export const CALLOUT_SAFE_PADDING = 4;
export const CALLOUT_BELOW_OFFSET = 12;
export const CALLOUT_TOP_OFFSET = 4;
export const CALLOUT_COLUMN_GAP = 16;
export const CALLOUT_ROW_GAP = 16;
export const CALLOUT_CONNECTOR_DROP = 18;
export const CALLOUT_SIDE_ATTACH_THRESHOLD = 72;

const KEYCAP_FRAME_BORDER_WIDTH = 3;
const CALLOUT_ANCHOR_INSET = KEYCAP_FRAME_BORDER_WIDTH / 2;
const CALLOUT_TOP_ATTACH_INSET = 28;
const CALLOUT_SIDE_ATTACH_INSET_Y = 16;
const CALLOUT_SIDE_END_OVERLAP = 1.25;
const CALLOUT_TOP_END_OVERLAP = 1;
const CALLOUT_SIDE_START_INSET = 3.3;

const TITLE_LINE_HEIGHT = 17;
const DESCRIPTION_LINE_HEIGHT = 16;
const BOX_VERTICAL_PADDING = 20;
const TITLE_BOTTOM_GAP = 6;
const INNER_HORIZONTAL_PADDING = 28;
const STACK_HEIGHT_SAFETY = 18;

function normalizeAnnotationText(value) {
  return String(value || '').trim();
}

function getVisualLength(text) {
  if (!text) return 0;
  let len = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // ASCII/制御文字は半角(1)、それ以外は全角(2)として幅を換算
    if (code >= 0x00 && code <= 0x7f) {
      len += 1;
    } else {
      len += 2;
    }
  }
  return len;
}

function estimateWrappedLineCount(text, charsPerLine) {
  if (!text) return 0;

  return text
    .split('\n')
    .map((line) => Math.max(1, Math.ceil(getVisualLength(line) / charsPerLine)))
    .reduce((sum, count) => sum + count, 0);
}

function estimateCalloutWidth({ customText, description }) {
  const lines = []
    .concat(String(customText || '').split('\n'))
    .concat(String(description || '').split('\n'))
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return CALLOUT_MIN_WIDTH;
  }

  const longestLine = lines.reduce((max, line) => Math.max(max, getVisualLength(line)), 0);
  const estimatedWidth = (longestLine * 7.8 + INNER_HORIZONTAL_PADDING) * 1.25;

  return clamp(estimatedWidth, CALLOUT_MIN_WIDTH, CALLOUT_MAX_WIDTH);
}

function estimateCalloutHeight({ customText, description, estimatedWidth }) {
  const usableCharsPerLine = Math.max(
    8,
    Math.floor((estimatedWidth - INNER_HORIZONTAL_PADDING) / 7.8)
  );
  const titleCharsPerLine = Math.max(6, usableCharsPerLine - 2);
  const descriptionCharsPerLine = usableCharsPerLine;

  const titleLines = estimateWrappedLineCount(customText, titleCharsPerLine);
  const descriptionLines = estimateWrappedLineCount(description, descriptionCharsPerLine);

  const titleHeight = titleLines > 0 ? titleLines * TITLE_LINE_HEIGHT : 0;
  const descriptionHeight = descriptionLines > 0 ? descriptionLines * DESCRIPTION_LINE_HEIGHT : 0;
  const titleGap = titleHeight > 0 && descriptionHeight > 0 ? TITLE_BOTTOM_GAP : 0;

  return BOX_VERTICAL_PADDING + titleHeight + titleGap + descriptionHeight + STACK_HEIGHT_SAFETY;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function resolveOverlap(calloutsList, keyboardBottomY) {
  if (calloutsList.length <= 1) return;

  // 1. 本来の物理的位置 (lineStartY) で昇順ソートする
  calloutsList.sort((a, b) => a.lineStartY - b.lineStartY);

  const GAP = 9; // コールアウト間の最小隙間

  // 2. 上から下へのスキャン（下方向への押し出しで重なりを解決）
  for (let i = 1; i < calloutsList.length; i++) {
    const prev = calloutsList[i - 1];
    const curr = calloutsList[i];
    const minTop = prev.boxTop + prev.estimatedHeight + GAP;
    if (curr.boxTop < minTop) {
      curr.boxTop = minTop;
    }
  }

  // 3. 上方スペースの最大活用（アグレッシブ・トップシフト）
  // 複数アノテーションがある場合、最上部の boxTop が CALLOUT_SAFE_PADDING に達するまで
  // 全体を上にシフトして、上部の広大なデッドスペースを最大限に活用します。
  if (calloutsList.length >= 2) {
    const maxUpShift = calloutsList[0].boxTop - CALLOUT_SAFE_PADDING;
    if (maxUpShift > 0) {
      for (let i = 0; i < calloutsList.length; i++) {
        calloutsList[i].boxTop -= maxUpShift;
      }
    }
  }

  // 4. 下端オーバーフロー時の上方向への押し戻し
  const maxBottom = keyboardBottomY - CALLOUT_SAFE_PADDING;
  const lastIndex = calloutsList.length - 1;
  if (calloutsList[lastIndex].boxTop + calloutsList[lastIndex].estimatedHeight > maxBottom) {
    calloutsList[lastIndex].boxTop = maxBottom - calloutsList[lastIndex].estimatedHeight;

    for (let i = lastIndex - 1; i >= 0; i--) {
      const next = calloutsList[i + 1];
      const curr = calloutsList[i];
      const maxTop = next.boxTop - curr.estimatedHeight - GAP;
      if (curr.boxTop > maxTop) {
        curr.boxTop = maxTop;
      }
    }
  }

  // 5. 最上部が安全領域を越えないように上端を最終クランプ（押し戻しによって上にはみ出た場合）
  if (calloutsList[0].boxTop < CALLOUT_SAFE_PADDING) {
    calloutsList[0].boxTop = CALLOUT_SAFE_PADDING;
    // 上端を固定したので、再度下方向へ順に押し下げていく
    for (let i = 1; i < calloutsList.length; i++) {
      const prev = calloutsList[i - 1];
      const curr = calloutsList[i];
      const minTop = prev.boxTop + prev.estimatedHeight + GAP;
      if (curr.boxTop < minTop) {
        curr.boxTop = minTop;
      }
    }
  }
}

function getColumnLefts(svgWidth) {
  const usableWidth = Math.max(0, svgWidth - CALLOUT_SAFE_PADDING * 2);
  const columnWidth = CALLOUT_MAX_WIDTH + CALLOUT_COLUMN_GAP;
  const columnCount = Math.max(1, Math.floor((usableWidth + CALLOUT_COLUMN_GAP) / columnWidth));
  const totalWidth =
    columnCount * CALLOUT_MAX_WIDTH + Math.max(0, columnCount - 1) * CALLOUT_COLUMN_GAP;
  const startX = Math.max(
    CALLOUT_SAFE_PADDING,
    Math.floor((svgWidth - totalWidth) / 2)
  );

  return Array.from({ length: columnCount }, (_, index) => startX + index * columnWidth);
}

function createSideConnectorPath(callout) {
  const endX =
    callout.placement === 'left'
      ? callout.boxLeft + callout.estimatedWidth - CALLOUT_SIDE_END_OVERLAP
      : callout.boxLeft + CALLOUT_SIDE_END_OVERLAP;
  const endY = clamp(
    callout.lineStartY,
    callout.boxTop + CALLOUT_SIDE_ATTACH_INSET_Y,
    callout.boxTop + callout.estimatedHeight - CALLOUT_SIDE_ATTACH_INSET_Y
  );

  return {
    connectorAttachSide: callout.placement,
    connectorPoints: [
      { x: callout.lineStartX, y: callout.lineStartY },
      { x: endX, y: endY },
    ],
    lineEndX: endX,
    lineEndY: endY,
  };
}

function createBelowConnectorPath(callout) {
  const start = { x: callout.lineStartX, y: callout.lineStartY };
  const drop = { x: callout.lineStartX, y: callout.lineStartY + CALLOUT_CONNECTOR_DROP };
  const boxCenterX = callout.boxLeft + callout.estimatedWidth / 2;
  const horizontalDelta = Math.abs(boxCenterX - callout.lineStartX);
  const preferSideAttach = horizontalDelta > Math.max(CALLOUT_SIDE_ATTACH_THRESHOLD, callout.estimatedWidth * 0.26);

  if (!preferSideAttach) {
    const endX = clamp(
      callout.lineStartX,
      callout.boxLeft + CALLOUT_TOP_ATTACH_INSET,
      callout.boxLeft + callout.estimatedWidth - CALLOUT_TOP_ATTACH_INSET
    );
    const endY = callout.boxTop + CALLOUT_TOP_END_OVERLAP;

    return {
      connectorAttachSide: 'top',
      connectorPoints: [start, drop, { x: endX, y: endY }],
      lineEndX: endX,
      lineEndY: endY,
    };
  }

  const attachLeftSide = callout.lineStartX < boxCenterX;
  const sideX = attachLeftSide
    ? callout.boxLeft + CALLOUT_SIDE_END_OVERLAP
    : callout.boxLeft + callout.estimatedWidth - CALLOUT_SIDE_END_OVERLAP;
  const sideY = clamp(
    drop.y + 10,
    callout.boxTop + CALLOUT_SIDE_ATTACH_INSET_Y,
    callout.boxTop + callout.estimatedHeight - CALLOUT_SIDE_ATTACH_INSET_Y
  );
  const sideEntry = { x: sideX, y: sideY };

  return {
    connectorAttachSide: attachLeftSide ? 'left' : 'right',
    connectorPoints: [start, drop, sideEntry],
    lineEndX: sideEntry.x,
    lineEndY: sideEntry.y,
  };
}

function decorateConnectorPath(callout) {
  if (callout.placement === 'below') {
    return createBelowConnectorPath(callout);
  }
  return createSideConnectorPath(callout);
}

export function buildCalloutOverlayModel({
  keys,
  keyAnnotations,
  scaleMetrics,
}) {
  if (!scaleMetrics || !Array.isArray(keys) || keys.length === 0) {
    return null;
  }

  const finalScale = scaleMetrics.finalScale;
  const maxWidth = scaleMetrics.maxWidth;
  const maxHeight = scaleMetrics.maxHeight;
  const containerWidth = scaleMetrics.containerWidth;

  if (
    !Number.isFinite(finalScale) ||
    !Number.isFinite(maxWidth) ||
    !Number.isFinite(maxHeight) ||
    !Number.isFinite(containerWidth)
  ) {
    return null;
  }

  const svgWidth = containerWidth;
  const keyboardHeight = maxHeight * finalScale + CALLOUT_TOP_OFFSET * 2;
  const keyboardBottomY = CALLOUT_TOP_OFFSET + maxHeight * finalScale;

  const annotatedKeys = [];
  let occupiedLeftEdge = Number.POSITIVE_INFINITY;
  let occupiedRightEdge = Number.NEGATIVE_INFINITY;

  keys.forEach((key) => {
    const matrixKey = key.matrix ? `${key.matrix[0]},${key.matrix[1]}` : key.id;
    const keyLeft = key.x + 20;
    const keyRight = key.x + key.w + 14;
    const keyTop = key.y + 20;
    const keyBottom = key.y + key.h + 14;

    const screenKeyLeftEdge = containerWidth / 2 + (keyLeft - maxWidth / 2) * finalScale;
    const screenKeyRightEdge = containerWidth / 2 + (keyRight - maxWidth / 2) * finalScale;
    const screenKeyTopEdge = CALLOUT_TOP_OFFSET + keyTop * finalScale;
    const screenKeyBottomY = CALLOUT_TOP_OFFSET + keyBottom * finalScale;
    const screenCenterX = (screenKeyLeftEdge + screenKeyRightEdge) / 2;
    const screenCenterY = (screenKeyTopEdge + screenKeyBottomY) / 2;
    occupiedLeftEdge = Math.min(occupiedLeftEdge, screenKeyLeftEdge);
    occupiedRightEdge = Math.max(occupiedRightEdge, screenKeyRightEdge);

    const annotation = keyAnnotations?.[matrixKey];
    const customText = normalizeAnnotationText(annotation?.customText);
    const description = normalizeAnnotationText(annotation?.description);

    if (!customText && !description) {
      return;
    }

    const estimatedWidth = estimateCalloutWidth({ customText, description });
    const estimatedHeight = estimateCalloutHeight({ customText, description, estimatedWidth });

    annotatedKeys.push({
      keyId: matrixKey,
      screenCenterX,
      screenCenterY,
      screenKeyLeftEdge,
      screenKeyRightEdge,
      screenKeyBottomY,
      estimatedHeight,
      estimatedWidth,
      customText,
      description,
    });
  });

  if (annotatedKeys.length === 0) {
    return null;
  }

  const leftSideCallouts = [];
  const rightSideCallouts = [];
  const fallbackCandidates = [];

  annotatedKeys.forEach((key) => {
    const isLeftSide = key.screenCenterX < containerWidth / 2;
    const sideBoxLeft = isLeftSide
      ? occupiedLeftEdge - CALLOUT_LINE_LENGTH - key.estimatedWidth
      : occupiedRightEdge + CALLOUT_LINE_LENGTH;
    const sideBoxTop = clamp(
      key.screenCenterY - key.estimatedHeight / 2,
      CALLOUT_SAFE_PADDING,
      Math.max(CALLOUT_SAFE_PADDING, keyboardBottomY - key.estimatedHeight)
    );
    const sideOverflow = isLeftSide
      ? sideBoxLeft < CALLOUT_SAFE_PADDING
      : sideBoxLeft + key.estimatedWidth > svgWidth - CALLOUT_SAFE_PADDING;

    if (sideOverflow) {
      fallbackCandidates.push({
        keyId: key.keyId,
        screenCenterX: key.screenCenterX,
        screenKeyBottomY: key.screenKeyBottomY - CALLOUT_ANCHOR_INSET,
        anchorX: key.screenCenterX,
        estimatedHeight: key.estimatedHeight,
        estimatedWidth: key.estimatedWidth,
        customText: key.customText,
        description: key.description,
      });
      return;
    }

    const calloutObj = {
      keyId: key.keyId,
      placement: isLeftSide ? 'left' : 'right',
      lineStartX:
        (isLeftSide ? key.screenKeyLeftEdge : key.screenKeyRightEdge) +
        (isLeftSide ? CALLOUT_SIDE_START_INSET : -CALLOUT_SIDE_START_INSET),
      lineStartY: key.screenCenterY,
      boxLeft: sideBoxLeft,
      boxTop: sideBoxTop,
      estimatedHeight: key.estimatedHeight,
      estimatedWidth: key.estimatedWidth,
      customText: key.customText,
      description: key.description,
    };

    if (isLeftSide) {
      leftSideCallouts.push(calloutObj);
    } else {
      rightSideCallouts.push(calloutObj);
    }
  });

  // 左右それぞれで重なりを解消
  resolveOverlap(leftSideCallouts, keyboardBottomY);
  resolveOverlap(rightSideCallouts, keyboardBottomY);

  const callouts = [];

  // スライドされた boxTop に基づいて lineEndY を正しく再計算し、最終リストに集約
  [...leftSideCallouts, ...rightSideCallouts].forEach((callout) => {
    callouts.push({
      ...callout,
      ...decorateConnectorPath(callout),
    });
  });

  if (fallbackCandidates.length > 0) {
    fallbackCandidates.sort((a, b) => a.anchorX - b.anchorX);

    const columnLefts = getColumnLefts(svgWidth);
    const columnHeights = columnLefts.map(() => keyboardBottomY + CALLOUT_BELOW_OFFSET);

    fallbackCandidates.forEach((callout) => {
      const preferredColumn = columnLefts.reduce(
        (bestIndex, columnLeft, index) => {
          const columnCenter = columnLeft + CALLOUT_MAX_WIDTH / 2;
          const bestCenter = columnLefts[bestIndex] + CALLOUT_MAX_WIDTH / 2;
          return Math.abs(columnCenter - callout.anchorX) < Math.abs(bestCenter - callout.anchorX)
            ? index
            : bestIndex;
        },
        0
      );

      let chosenColumn = preferredColumn;
      let chosenScore = Number.POSITIVE_INFINITY;
      const baseY = keyboardBottomY + CALLOUT_BELOW_OFFSET;

      columnLefts.forEach((columnLeft, index) => {
        const columnCenter = columnLeft + CALLOUT_MAX_WIDTH / 2;
        const stackedHeight = Math.max(0, columnHeights[index] - baseY);
        const stackUnits = stackedHeight / Math.max(1, callout.estimatedHeight + CALLOUT_ROW_GAP);
        const score =
          Math.abs(columnCenter - callout.anchorX) * 0.85 +
          stackUnits * 120;

        if (score < chosenScore) {
          chosenScore = score;
          chosenColumn = index;
        }
      });

      const boxLeft = columnLefts[chosenColumn];
      const boxTop = columnHeights[chosenColumn];

      callouts.push({
        ...callout,
        placement: 'below',
        lineStartX: callout.screenCenterX,
        lineStartY: callout.screenKeyBottomY,
        boxLeft,
        boxTop,
        ...decorateConnectorPath({
          ...callout,
          placement: 'below',
          lineStartX: callout.screenCenterX,
          lineStartY: callout.screenKeyBottomY,
          boxLeft,
          boxTop,
        }),
      });
      columnHeights[chosenColumn] += callout.estimatedHeight + CALLOUT_ROW_GAP;
    });
  }

  const hasBelow = callouts.some((callout) => callout.placement === 'below');
  const fallbackBottom =
    callouts
      .reduce((max, callout) => Math.max(max, callout.boxTop + callout.estimatedHeight), 0) || 0;

  let bottomPadding = 0;
  if (fallbackBottom > 0) {
    const overflowDiff = Math.ceil(fallbackBottom - keyboardHeight + CALLOUT_SAFE_PADDING);
    bottomPadding = hasBelow ? Math.max(0, overflowDiff) : Math.max(0, overflowDiff);
  }

  return {
    callouts,
    svgWidth,
    overlayHeight: keyboardHeight + bottomPadding,
    bottomPadding,
  };
}
