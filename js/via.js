/**
 * VIA Protocol Constants and Utilities
 */
export const VIA_COMMAND = {
    GET_PROTOCOL_VERSION: 0x01,
    GET_KEYBOARD_VALUE: 0x02,
    GET_DYNAMIC_KEYMAP_LAYER_COUNT: 0x11,
    GET_DYNAMIC_KEYMAP_BUFFER: 0x12,
    DYNAMIC_KEYMAP_GET_KEYCODE: 0xFC, 
    CUSTOM_SET_VALUE: 0x07,
    CUSTOM_GET_VALUE: 0x08,
};

export const KEYBOARD_VALUE_ID = {
    UPTIME: 0x01,
    LAYOUT_OPTIONS: 0x02,
    SWITCH_MATRIX_STATE: 0x03,
    CURRENT_LAYER: 0x04, // Some VIA versions support this
};

export class VIAClient {
    constructor(device) {
        this.device = device;
        this.onMatrixChanged = null;
    }

    async open() {
        if (!this.device.opened) {
            await this.device.open();
        }
        
        this.device.addEventListener('inputreport', (event) => {
            // Some keyboards send reports for matrix changes
            // But we'll mainly use polling for better compatibility
        });
    }

    async sendCommand(command, data = []) {
        const reportData = new Uint8Array(32);
        reportData[0] = command;
        for (let i = 0; i < data.length; i++) {
            reportData[i + 1] = data[i];
        }

        try {
            await this.device.sendReport(0x00, reportData);

            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    this.device.removeEventListener('inputreport', onInputReport);
                    reject(new Error('HID Timeout'));
                }, 1000);

                const onInputReport = (event) => {
                    // Check if the report is a response to our command
                    // In many VIA implementations, the first byte matches the command
                    const resData = new Uint8Array(event.data.buffer);
                    if (resData[0] === command) {
                        clearTimeout(timeout);
                        this.device.removeEventListener('inputreport', onInputReport);
                        resolve(resData);
                    }
                };
                this.device.addEventListener('inputreport', onInputReport);
            });
        } catch (e) {
            console.error('HID Error:', e);
            throw e;
        }
    }

    async getProtocolVersion() {
        const response = await this.sendCommand(VIA_COMMAND.GET_PROTOCOL_VERSION);
        return (response[1] << 8) | response[2];
    }

    async getLayerCount() {
        const response = await this.sendCommand(VIA_COMMAND.GET_DYNAMIC_KEYMAP_LAYER_COUNT);
        return response[1];
    }

    async getKeycode(layer, row, col) {
        const response = await this.sendCommand(VIA_COMMAND.DYNAMIC_KEYMAP_GET_KEYCODE, [layer, row, col]);
        return (response[4] << 8) | response[5];
    }

    async getMatrixState() {
        const response = await this.sendCommand(VIA_COMMAND.GET_KEYBOARD_VALUE, [KEYBOARD_VALUE_ID.SWITCH_MATRIX_STATE]);
        return response.slice(1);
    }

    async getCurrentLayer() {
        try {
            const response = await this.sendCommand(VIA_COMMAND.GET_KEYBOARD_VALUE, [KEYBOARD_VALUE_ID.CURRENT_LAYER]);
            return response[1];
        } catch (e) {
            return null;
        }
    }

    async readBuffer(offset, length) {
        const response = await this.sendCommand(VIA_COMMAND.GET_DYNAMIC_KEYMAP_BUFFER, [
            (offset >> 8) & 0xFF,
            offset & 0xFF,
            length
        ]);
        // VIA response for 0x12 starts with command, then 3 bytes of address/len, then data
        return response.slice(4, 4 + length);
    }
}
