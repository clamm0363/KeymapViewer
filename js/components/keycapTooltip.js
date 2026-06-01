import { getKeycodeTooltipInfo } from '../utils/tooltipEngine.js';
import { buildKeyInspectorTooltipLines } from '../utils/keyInspector.js';

function joinTooltipLines(lines) {
  return lines.filter(Boolean).join('\n');
}

function getMacroActionLabel(code, keyStyle = 'Windows') {
  const tooltipInfo = getKeycodeTooltipInfo(code, code, keyStyle);
  const description =
    tooltipInfo.description ||
    tooltipInfo.officialCode ||
    String(code || '')
      .trim()
      .toUpperCase();
  return description.replace(/\s*\([^)]*\)\s*$/u, '');
}

function formatLiteralText(text) {
  const normalized = String(text || '').replace(/\r/g, '');
  if (!normalized) return '';
  return `Type "${normalized}"`;
}

function translateMacroStep(token, keyStyle = 'Windows') {
  const source = String(token || '').trim();
  if (!source) return '';

  if (/^\d+$/.test(source)) {
    return `Wait ${source} ms`;
  }

  if (source.startsWith('+')) {
    return `Hold ${getMacroActionLabel(source.slice(1), keyStyle)}`;
  }

  if (source.startsWith('-')) {
    return `Release ${getMacroActionLabel(source.slice(1), keyStyle)}`;
  }

  if (source.includes(',')) {
    const keys = source
      .split(',')
      .map((part) => getMacroActionLabel(part.trim(), keyStyle))
      .filter(Boolean);
    return keys.length > 0 ? `Tap ${keys.join(' + ')}` : '';
  }

  return `Tap ${getMacroActionLabel(source, keyStyle)}`;
}

function translateMacroContent(content, keyStyle = 'Windows') {
  const source = String(content || '');
  if (!source) return [];

  const tokens = source.match(/\{[^}]*\}|[^{}]+/g) || [];
  const steps = [];

  tokens.forEach((token) => {
    if (token.startsWith('{') && token.endsWith('}')) {
      const translated = translateMacroStep(token.slice(1, -1), keyStyle);
      if (translated) steps.push(translated);
      return;
    }

    const literal = formatLiteralText(token);
    if (literal) steps.push(literal);
  });

  return steps;
}

function getMacroContentInfo(code, macros = []) {
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

function getMacroSteps(code, macros = [], keyStyle = 'Windows') {
  const macroInfo = getMacroContentInfo(code, macros);
  if (!macroInfo) return null;
  if (!macroInfo.content) return ['Empty'];

  const translatedSteps = translateMacroContent(macroInfo.content, keyStyle);
  return translatedSteps.length > 0 ? translatedSteps : [macroInfo.content];
}

function appendMacroContentLines(lines, code, macros = [], keyStyle = 'Windows') {
  const macroInfo = getMacroContentInfo(code, macros);
  if (!macroInfo) return;

  if (macroInfo.content) {
    const translatedSteps = translateMacroContent(macroInfo.content, keyStyle);
    lines.push('Macro actions:');
    if (translatedSteps.length > 0) {
      translatedSteps.forEach((step) => lines.push(step));
    } else {
      lines.push(macroInfo.content);
    }
    return;
  }

  lines.push('Macro actions: Empty');
}

function formatActionLine(prefix, label, tooltipInfo, code, macros = []) {
  const lines = [`${prefix}: ${label || 'None'} (${tooltipInfo.officialCode || 'KC_NO'})`];
  if (tooltipInfo.description) {
    lines.push(`  ${tooltipInfo.description}`);
  }
  appendMacroContentLines(lines, code, macros, tooltipInfo.keyStyle || 'Windows');
  return lines.join('\n');
}

export function buildStandardKeyTooltip(
  code,
  keyStyle = 'Windows',
  macros = [],
  inspectorData = null,
  annotation = null
) {
  const tooltipInfo = getKeycodeTooltipInfo(code, code, keyStyle);
  const lines = [];

  if (annotation) {
    if (annotation.customText) lines.push(`${annotation.customText}`);
    if (annotation.description) lines.push(`   ${annotation.description}`);
    if (annotation.customText || annotation.description) lines.push('----');
  }

  lines.push(tooltipInfo.officialCode);

  if (tooltipInfo.description) {
    lines.push(tooltipInfo.description);
  }

  appendMacroContentLines(lines, code, macros, keyStyle);

  if (tooltipInfo.isAliasInput) {
    lines.push(`Input: ${tooltipInfo.inputCode}`);
  }

  const inspectorLines = buildKeyInspectorTooltipLines(inspectorData);
  if (inspectorLines.length > 0) {
    lines.push('');
    inspectorLines.forEach((line) => lines.push(line));
  }

  return joinTooltipLines(lines);
}

export function buildEncoderActionTooltip(prefix, label, code, keyStyle = 'Windows', macros = []) {
  const tooltipInfo = getKeycodeTooltipInfo(code, code, keyStyle);
  return formatActionLine(prefix, label, { ...tooltipInfo, keyStyle }, code, macros);
}

export function buildEncoderTooltip({
  encoderIndex,
  pushText,
  pushCode,
  macros = [],
  keyStyle = 'Windows',
  currentStyle,
  ccwActions,
  ccwLabel,
  cwLabel,
  ccwCode,
  cwCode,
  trackballCwPrefix = 'CW-MAPPED',
  trackballCcwPrefix = 'CCW-MAPPED',
  annotation = null,
}) {
  const lines = [];

  if (annotation) {
    if (annotation.customText) lines.push(`${annotation.customText}`);
    if (annotation.description) lines.push(`   ${annotation.description}`);
    if (annotation.customText || annotation.description) lines.push('----');
  }

  lines.push(`Encoder e${encoderIndex}`);

  lines.push(buildEncoderActionTooltip('Push', pushText, pushCode || 'KC_NO', keyStyle, macros));

  if (!ccwActions) {
    return joinTooltipLines(lines);
  }

  if (currentStyle === 'VerticalWheel') {
    lines.push(buildEncoderActionTooltip('UP', cwLabel, cwCode, keyStyle, macros));
    lines.push(buildEncoderActionTooltip('DOWN', ccwLabel, ccwCode, keyStyle, macros));
    return joinTooltipLines(lines);
  }

  if (currentStyle === 'HorizontalWheel') {
    lines.push(buildEncoderActionTooltip('RIGHT', cwLabel, cwCode, keyStyle, macros));
    lines.push(buildEncoderActionTooltip('LEFT', ccwLabel, ccwCode, keyStyle, macros));
    return joinTooltipLines(lines);
  }

  if (currentStyle === 'Trackball' || currentStyle === 'Touchpad') {
    lines.push(buildEncoderActionTooltip(trackballCwPrefix, cwLabel, cwCode, keyStyle, macros));
    lines.push(buildEncoderActionTooltip(trackballCcwPrefix, ccwLabel, ccwCode, keyStyle, macros));
    return joinTooltipLines(lines);
  }

  lines.push(buildEncoderActionTooltip('CW (Clockwise)', cwLabel, cwCode, keyStyle, macros));
  lines.push(
    buildEncoderActionTooltip('CCW (Counter-Clockwise)', ccwLabel, ccwCode, keyStyle, macros)
  );
  return joinTooltipLines(lines);
}

export function buildStandardHoverInfo(
  code,
  keyStyle = 'Windows',
  macros = [],
  inspectorData = null,
  annotation = null
) {
  const tooltipInfo = getKeycodeTooltipInfo(code, code, keyStyle);
  const debugLines = buildKeyInspectorTooltipLines(inspectorData);

  const macroInfo = getMacroContentInfo(code, macros);
  let macroSteps = null;
  if (macroInfo && macroInfo.content) {
    macroSteps = translateMacroContent(macroInfo.content, keyStyle);
  }

  return {
    annotation,
    officialCode: tooltipInfo.officialCode,
    description: tooltipInfo.description,
    inputCode: tooltipInfo.inputCode,
    isAliasInput: tooltipInfo.isAliasInput,
    macros: macroSteps,
    debugLines,
    isEncoder: false,
  };
}

export function buildEncoderHoverInfo({
  encoderIndex,
  pushText,
  pushCode,
  macros = [],
  keyStyle = 'Windows',
  currentStyle,
  ccwActions,
  ccwLabel,
  cwLabel,
  ccwCode,
  cwCode,
  trackballCwPrefix = 'CW-MAPPED',
  trackballCcwPrefix = 'CCW-MAPPED',
  annotation = null,
}) {
  const pushInfo = {
    label: pushText,
    code: pushCode || 'KC_NO',
    desc: getKeycodeTooltipInfo(pushCode || 'KC_NO', pushCode || 'KC_NO', keyStyle).description,
    macros: getMacroSteps(pushCode || 'KC_NO', macros, keyStyle),
  };

  let cwInfo = null;
  let ccwInfo = null;

  if (ccwActions) {
    let cwPrefix = 'CW (Clockwise)';
    let ccwPrefix = 'CCW (Counter-Clockwise)';

    if (currentStyle === 'VerticalWheel') {
      cwPrefix = 'UP';
      ccwPrefix = 'DOWN';
    } else if (currentStyle === 'HorizontalWheel') {
      cwPrefix = 'RIGHT';
      ccwPrefix = 'LEFT';
    } else if (currentStyle === 'Trackball' || currentStyle === 'Touchpad') {
      cwPrefix = trackballCwPrefix;
      ccwPrefix = trackballCcwPrefix;
    }

    cwInfo = {
      prefix: cwPrefix,
      label: cwLabel,
      code: cwCode,
      desc: getKeycodeTooltipInfo(cwCode, cwCode, keyStyle).description,
      macros: getMacroSteps(cwCode, macros, keyStyle),
    };

    ccwInfo = {
      prefix: ccwPrefix,
      label: ccwLabel,
      code: ccwCode,
      desc: getKeycodeTooltipInfo(ccwCode, ccwCode, keyStyle).description,
      macros: getMacroSteps(ccwCode, macros, keyStyle),
    };
  }

  return {
    annotation,
    isEncoder: true,
    encoderIndex,
    pushInfo,
    cwInfo,
    ccwInfo,
  };
}
