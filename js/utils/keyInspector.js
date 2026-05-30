import { getKeycodeTooltipInfo } from '../keymap-dictionary.js';
import { getKeyCategory } from '../components/keycapIconUtils.js';

function joinVisibleParts(parts) {
  return parts
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join(' | ');
}

function getMacroInspectorInfo(code, macros = []) {
  const source = String(code || '').trim();
  const match = source.match(/^MACRO\((\d+)\)$/i);
  if (!match) return null;

  const macroId = Number(match[1]);
  const content = Array.isArray(macros) ? macros[macroId] : '';
  return {
    macroId,
    content: typeof content === 'string' ? content : '',
  };
}

function containsPrivateUseGlyph(value) {
  return /[\uE000-\uF8FF]/u.test(String(value || ''));
}

function normalizeInspectorLabel(label, fallbackLabel = '') {
  const normalized = String(label || '')
    .replace(/\n/g, ' / ')
    .trim();
  if (normalized && !containsPrivateUseGlyph(normalized)) {
    return normalized;
  }

  const fallback = String(fallbackLabel || '')
    .replace(/\n/g, ' / ')
    .trim();
  return fallback || normalized;
}

function buildResolvedLabel({ displayModel, parsed }) {
  if (displayModel?.route === 'layer') {
    return normalizeInspectorLabel(
      joinVisibleParts([displayModel.topTag, displayModel.primaryText, displayModel.secondaryText]),
      parsed.textFallback
    );
  }

  if (displayModel?.route === 'mod') {
    return normalizeInspectorLabel(
      joinVisibleParts([parsed.modLabel, parsed.baseLabel || displayModel.centerText]),
      parsed.textFallback
    );
  }

  if (displayModel?.route === 'standard' && displayModel.bottomLabel) {
    return normalizeInspectorLabel(displayModel.bottomLabel, parsed.textFallback);
  }

  return normalizeInspectorLabel(
    displayModel?.centerText || parsed.displayText || '',
    parsed.textFallback
  );
}

function buildBottomSummary(displayModel) {
  if (!displayModel || displayModel.route !== 'standard') return '';
  return joinVisibleParts([displayModel.bottomLabel, displayModel.bottomCaption]);
}

function buildRenderSummary(displayModel) {
  if (!displayModel) return '';
  return joinVisibleParts([displayModel.route, displayModel.variant]);
}

function buildIconSummary({ displayModel, iconRenderState }) {
  const iconKey = displayModel?.resolvedIconKey || displayModel?.iconKey || '';
  if (!iconKey && !iconRenderState?.actuallyShowingSvg) return '';
  return joinVisibleParts([iconKey, iconRenderState?.actuallyShowingSvg ? 'svg' : 'text']);
}

export function buildKeyInspectorData({
  code,
  keyStyle = 'Windows',
  displayRaw,
  targetIconKey,
  parsed,
  iconRenderState,
  displayModel,
  macros = [],
}) {
  const tooltipInfo = getKeycodeTooltipInfo(code, code, keyStyle);
  const category = getKeyCategory(targetIconKey || displayRaw || tooltipInfo.officialCode || '');
  const macroInfo = getMacroInspectorInfo(code, macros);

  return {
    inputCode:
      tooltipInfo.inputCode ||
      String(code || '')
        .trim()
        .toUpperCase(),
    officialCode: tooltipInfo.officialCode || '',
    label: buildResolvedLabel({ displayModel, parsed }),
    category: category || '',
    icon: buildIconSummary({ displayModel, iconRenderState }),
    render: buildRenderSummary(displayModel),
    bottom: buildBottomSummary(displayModel),
    macro: macroInfo ? `M${macroInfo.macroId} = ${macroInfo.content || 'Empty'}` : '',
  };
}

export function buildKeyInspectorTooltipLines(inspectorData) {
  if (!inspectorData) return [];

  const lines = [
    '---- DEBUG ----',
    `Input: ${inspectorData.inputCode || 'None'}`,
    `Official: ${inspectorData.officialCode || 'None'}`,
    `Label: ${inspectorData.label || 'None'}`,
  ];

  if (inspectorData.category) {
    lines.push(`Category: ${inspectorData.category}`);
  }

  if (inspectorData.icon) {
    lines.push(`Icon: ${inspectorData.icon}`);
  }

  if (inspectorData.render) {
    lines.push(`Render: ${inspectorData.render}`);
  }

  if (inspectorData.bottom) {
    lines.push(`Bottom: ${inspectorData.bottom}`);
  }

  if (inspectorData.macro) {
    lines.push(`Macro: ${inspectorData.macro}`);
  }

  return lines;
}
