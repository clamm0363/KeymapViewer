import { getRawLabel } from '../helpers.js';

export const VIA_USAGE_PAGE = 0xff60;
export const VIA_USAGE = 0x61;
const VIA_REPORT_SIZE = 32;
const _VIA_COMMAND_START = 0x00;
const VIA_DATA_BUFFER_SIZE = 28;
const _VIA_PROTOCOL_ALPHA = 7;
const VIA_PROTOCOL_BETA = 8;

const VIA_COMMANDS = Object.freeze({
  getProtocolVersion: 1,
  dynamicKeymapGetKeycode: 4,
  dynamicKeymapMacroGetCount: 12,
  dynamicKeymapMacroGetBufferSize: 13,
  dynamicKeymapMacroGetBuffer: 14,
  dynamicKeymapGetLayerCount: 17,
  dynamicKeymapGetBuffer: 18,
  dynamicKeymapGetEncoder: 20,
});

function toUint16(msb, lsb) {
  return ((msb & 0xff) << 8) | (lsb & 0xff);
}

function fromUint16(value) {
  return [(value >> 8) & 0xff, value & 0xff];
}

function getOutputReportId(device) {
  const outputReport = (device.collections || [])
    .flatMap((collection) => collection.outputReports || [])
    .find(() => true);
  return outputReport ? outputReport.reportId : 0;
}

function normalizeResponseData(dataView) {
  const bytes = new Uint8Array(dataView.buffer, dataView.byteOffset, dataView.byteLength);
  return new Uint8Array(bytes);
}

async function ensureDeviceOpen(device) {
  if (!device.opened) {
    await device.open();
  }
}

async function sendViaCommand(device, commandId, payload = []) {
  await ensureDeviceOpen(device);

  const commandBuffer = new Uint8Array(VIA_REPORT_SIZE);
  commandBuffer[0] = commandId;
  commandBuffer.set(payload.slice(0, VIA_REPORT_SIZE - 1), 1);

  const outputReportId = getOutputReportId(device);

  return new Promise((resolve, reject) => {
    let timeoutId = null;

    const cleanup = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      device.removeEventListener('inputreport', handleInputReport);
    };

    const handleInputReport = (event) => {
      if (event.device !== device) return;

      const response = normalizeResponseData(event.data);
      if (response[0] !== commandId) {
        return;
      }

      cleanup();
      resolve(response);
    };

    device.addEventListener('inputreport', handleInputReport);
    timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error('デバイスからの応答がタイムアウトしました。'));
    }, 2500);

    device.sendReport(outputReportId, commandBuffer).catch((error) => {
      cleanup();
      reject(error);
    });
  });
}

async function readProtocolVersion(device) {
  const response = await sendViaCommand(device, VIA_COMMANDS.getProtocolVersion);
  return toUint16(response[1], response[2]);
}

async function readLayerCount(device, protocolVersion) {
  if (protocolVersion < VIA_PROTOCOL_BETA) {
    return 4;
  }

  const response = await sendViaCommand(device, VIA_COMMANDS.dynamicKeymapGetLayerCount);
  return response[1] || 4;
}

async function readKey(device, layer, row, col) {
  const response = await sendViaCommand(device, VIA_COMMANDS.dynamicKeymapGetKeycode, [
    layer,
    row,
    col,
  ]);
  return toUint16(response[4], response[5]);
}

async function readKeymapBuffer(device, offset, size) {
  const [offsetMsb, offsetLsb] = fromUint16(offset);
  const response = await sendViaCommand(device, VIA_COMMANDS.dynamicKeymapGetBuffer, [
    offsetMsb,
    offsetLsb,
    size,
  ]);
  return Array.from(response.slice(4, 4 + size));
}

async function readLayerMatrix(device, matrixInfo, layer, protocolVersion) {
  const totalKeys = matrixInfo.rows * matrixInfo.cols;

  if (protocolVersion >= VIA_PROTOCOL_BETA) {
    const bytes = [];
    let remaining = totalKeys;
    let consumed = 0;

    while (remaining > 0) {
      const chunkKeyCount = Math.min(14, remaining);
      const offset = layer * totalKeys * 2 + consumed * 2;
      const chunk = await readKeymapBuffer(device, offset, chunkKeyCount * 2);
      bytes.push(...chunk);
      consumed += chunkKeyCount;
      remaining -= chunkKeyCount;
    }

    const keycodes = [];
    for (let index = 0; index < bytes.length; index += 2) {
      keycodes.push(toUint16(bytes[index], bytes[index + 1]));
    }
    return keycodes;
  }

  const keycodes = [];
  for (let index = 0; index < totalKeys; index += 1) {
    const row = Math.floor(index / matrixInfo.cols);
    const col = index % matrixInfo.cols;
    keycodes.push(await readKey(device, layer, row, col));
  }
  return keycodes;
}

function getEncoderIndicesFromDesign(design) {
  if (!design || !design.layouts || !design.layouts.keymap) return [];

  const indices = new Set();
  design.layouts.keymap.forEach((row) => {
    row.forEach((item) => {
      if (typeof item !== 'string') return;
      item.split('\n').forEach((part) => {
        const trimmed = part.trim();
        if (/^e\d+$/i.test(trimmed)) {
          indices.add(Number(trimmed.slice(1)));
        }
      });
    });
  });

  return [...indices].sort((a, b) => a - b);
}

async function readEncoderLayers(device, design, layerCount, protocolVersion, formatKeycode) {
  if (protocolVersion < VIA_PROTOCOL_BETA) {
    return [];
  }

  const encoderIndices = getEncoderIndicesFromDesign(design);
  if (encoderIndices.length === 0) {
    return [];
  }

  const layers = [];
  for (let layer = 0; layer < layerCount; layer += 1) {
    const encoderLayer = [];
    for (const encoderIndex of encoderIndices) {
      const ccwResponse = await sendViaCommand(device, VIA_COMMANDS.dynamicKeymapGetEncoder, [
        layer,
        encoderIndex,
        0,
      ]);
      const cwResponse = await sendViaCommand(device, VIA_COMMANDS.dynamicKeymapGetEncoder, [
        layer,
        encoderIndex,
        1,
      ]);
      encoderLayer.push([
        formatKeycode(toUint16(ccwResponse[4], ccwResponse[5])),
        formatKeycode(toUint16(cwResponse[4], cwResponse[5])),
      ]);
    }
    layers.push(encoderLayer);
  }

  return layers;
}

async function readMacroCount(device) {
  const response = await sendViaCommand(device, VIA_COMMANDS.dynamicKeymapMacroGetCount);
  return response[1] || 0;
}

async function readMacroBufferSize(device) {
  const response = await sendViaCommand(device, VIA_COMMANDS.dynamicKeymapMacroGetBufferSize);
  return toUint16(response[1], response[2]);
}

async function readMacros(device, decoder = new TextDecoder()) {
  const macroCount = await readMacroCount(device);
  if (!macroCount) return [];

  const macroBufferSize = await readMacroBufferSize(device);
  const macroBytes = [];

  for (let offset = 0; offset < macroBufferSize; offset += VIA_DATA_BUFFER_SIZE) {
    const remaining = macroBufferSize - offset;
    const readSize = Math.min(VIA_DATA_BUFFER_SIZE, remaining);
    const [offsetMsb, offsetLsb] = fromUint16(offset);
    const response = await sendViaCommand(device, VIA_COMMANDS.dynamicKeymapMacroGetBuffer, [
      offsetMsb,
      offsetLsb,
      VIA_DATA_BUFFER_SIZE,
    ]);
    macroBytes.push(...Array.from(response.slice(4, 4 + readSize)));
  }

  const macros = [];
  let current = [];

  macroBytes.forEach((byte) => {
    if (byte === 0x00) {
      macros.push(decoder.decode(new Uint8Array(current)));
      current = [];
      return;
    }
    current.push(byte);
  });

  if (current.length > 0) {
    macros.push(decoder.decode(new Uint8Array(current)));
  }

  while (macros.length < macroCount) {
    macros.push('');
  }

  return macros.slice(0, macroCount);
}

function formatViaKeycode(value) {
  if (value === 0x0000) {
    return '';
  }

  if (value === 0x0001 || value === 0xffff) {
    return 'KC_TRNS';
  }

  const rawLabel = getRawLabel(value);
  return rawLabel || `0x${value.toString(16).toUpperCase()}`;
}

export async function requestViaDevice(_filters) {
  if (!navigator.hid) {
    throw new Error('このブラウザは WebHID に対応していません。');
  }

  const devices = await navigator.hid.requestDevice({
    filters: [{ usagePage: VIA_USAGE_PAGE }],
  });

  return devices[0] || null;
}

export async function readViaDeviceKeymap(device, definition) {
  if (!device) {
    throw new Error('読み込み対象のデバイスが選択されていません。');
  }

  const matrixInfo = definition && definition.matrix;
  if (!matrixInfo || !Number.isFinite(matrixInfo.rows) || !Number.isFinite(matrixInfo.cols)) {
    throw new Error('デバイス定義に matrix 情報がありません。');
  }

  try {
    const protocolVersion = await readProtocolVersion(device);
    const layerCount = await readLayerCount(device, protocolVersion);

    const layers = [];
    for (let layer = 0; layer < layerCount; layer += 1) {
      const rawLayer = await readLayerMatrix(device, matrixInfo, layer, protocolVersion);
      layers.push(rawLayer.map((value) => formatViaKeycode(value)));
    }

    let encoders = [];
    try {
      encoders = await readEncoderLayers(
        device,
        definition,
        layerCount,
        protocolVersion,
        formatViaKeycode
      );
    } catch (error) {
      console.warn('Failed to read encoder mappings:', error);
    }

    let macros = [];
    try {
      macros = await readMacros(device);
    } catch (error) {
      console.warn('Failed to read macros:', error);
    }

    return {
      name: definition.name || device.productName || 'Connected Device',
      layers,
      macros,
      macroAliases: {},
      encoders,
    };
  } finally {
    try {
      if (device.opened) {
        await device.close();
      }
    } catch (error) {
      console.warn('Failed to close HID device:', error);
    }
  }
}
