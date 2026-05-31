export const CALLOUT_MAX_WIDTH = 280;
export const CALLOUT_MIN_WIDTH = 160;
export const CALLOUT_LINE_LENGTH = 48;
export const CALLOUT_SAFE_PADDING = 4;
export const CALLOUT_BELOW_OFFSET = 12;
export const CALLOUT_BOTTOM_PADDING = 360;
export const CALLOUT_TOP_OFFSET = 4;
export const CALLOUT_COLUMN_GAP = 16;
export const CALLOUT_ROW_GAP = 20;

const TITLE_LINE_HEIGHT = 15;
const DESCRIPTION_LINE_HEIGHT = 14;
const BOX_VERTICAL_PADDING = 16;
const TITLE_BOTTOM_GAP = 4;
const WIDTH_PER_CHARACTER = 9;
const INNER_HORIZONTAL_PADDING = 28;
const STACK_HEIGHT_SAFETY = 10;

function normalizeAnnotationText(value) {
  return String(value || '').trim();
}

function estimateWrappedLineCount(text, charsPerLine) {
  if (!text) return 0;

  return text
    .split('\n')
    .map((line) => Math.max(1, Math.ceil(line.length / charsPerLine)))
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

  const longestLine = lines.reduce((max, line) => Math.max(max, line.length), 0);
  const estimatedWidth = longestLine * WIDTH_PER_CHARACTER + INNER_HORIZONTAL_PADDING;

  return clamp(estimatedWidth, CALLOUT_MIN_WIDTH, CALLOUT_MAX_WIDTH);
}

function estimateCalloutHeight({ customText, description, estimatedWidth }) {
  const usableCharsPerLine = Math.max(
    8,
    Math.floor((estimatedWidth - INNER_HORIZONTAL_PADDING) / WIDTH_PER_CHARACTER)
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

  const callouts = [];
  const fallbackCandidates = [];

  keys.forEach((key) => {
    const matrixKey = key.matrix ? `${key.matrix[0]},${key.matrix[1]}` : key.id;
    const annotation = keyAnnotations?.[matrixKey];
    const customText = normalizeAnnotationText(annotation?.customText);
    const description = normalizeAnnotationText(annotation?.description);

    if (!customText && !description) {
      return;
    }

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
    const isLeftSide = key.x + key.w / 2 < maxWidth / 2;
    const estimatedWidth = estimateCalloutWidth({ customText, description });
    const estimatedHeight = estimateCalloutHeight({ customText, description, estimatedWidth });

    const sideBoxLeft = isLeftSide
      ? screenKeyLeftEdge - CALLOUT_LINE_LENGTH - estimatedWidth
      : screenKeyRightEdge + CALLOUT_LINE_LENGTH;
    const sideBoxTop = clamp(
      screenCenterY - estimatedHeight / 2,
      CALLOUT_SAFE_PADDING,
      Math.max(CALLOUT_SAFE_PADDING, keyboardBottomY - estimatedHeight)
    );
    const sideOverflow = isLeftSide
      ? sideBoxLeft < CALLOUT_SAFE_PADDING
      : sideBoxLeft + estimatedWidth > svgWidth - CALLOUT_SAFE_PADDING;

    if (sideOverflow) {
      fallbackCandidates.push({
        keyId: matrixKey,
        screenCenterX,
        screenKeyBottomY,
        anchorX: screenCenterX,
        estimatedHeight,
        estimatedWidth,
        customText,
        description,
      });
      return;
    }

    callouts.push({
      keyId: matrixKey,
      placement: isLeftSide ? 'left' : 'right',
      lineStartX: isLeftSide ? screenKeyLeftEdge : screenKeyRightEdge,
      lineStartY: screenCenterY,
      lineEndX: isLeftSide
        ? sideBoxLeft + estimatedWidth
        : sideBoxLeft,
      lineEndY: clamp(screenCenterY, sideBoxTop, sideBoxTop + estimatedHeight),
      boxLeft: sideBoxLeft,
      boxTop: sideBoxTop,
      estimatedHeight,
      estimatedWidth,
      customText,
      description,
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
        lineEndX: boxLeft + callout.estimatedWidth / 2,
        lineEndY: boxTop,
        boxLeft,
        boxTop,
      });
      columnHeights[chosenColumn] += callout.estimatedHeight + CALLOUT_ROW_GAP;
    });
  }

  if (callouts.length === 0) {
    return null;
  }

  const fallbackBottom =
    callouts
      .filter((callout) => callout.placement === 'below')
      .reduce((max, callout) => Math.max(max, callout.boxTop + callout.estimatedHeight), 0) || 0;
  const bottomPadding =
    fallbackBottom > 0
      ? Math.max(
          CALLOUT_BOTTOM_PADDING,
          Math.ceil(fallbackBottom - keyboardHeight + CALLOUT_SAFE_PADDING)
        )
      : 0;

  return {
    callouts,
    svgWidth,
    overlayHeight: keyboardHeight + bottomPadding,
    bottomPadding,
  };
}
