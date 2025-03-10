const ENC_KEY = 'my-key'; // MAKE SURE TO IMPLEMENT THE SAME KEY IN THE BACK-END

bluetooth.startUartService();
pins.digitalWritePin(DigitalPin.P2, 1);


const encryptXOR = (value: string, key: string): string => {
    let res = '';
    for (let i = 0; i < value.length; i++) {
        res += String.fromCharCode(value.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return res;
};


bluetooth.onBluetoothConnected(function () {
    connected = true;
    basic.showIcon(IconNames.Yes);
});
bluetooth.onBluetoothDisconnected(function () {
    connected = false;
    basic.showIcon(IconNames.No);
});

let connected = false;

basic.forever(function () {
    pins.digitalWritePin(DigitalPin.P2, 1);
    if (connected) {
        let result = (pins.analogReadPin(AnalogPin.P0) / 1023.0).toString();
        if (result.length > 20) {
            result = result.substr(0, 20);
        }
        bluetooth.uartWriteBuffer(Buffer.fromUTF8(encryptXOR(result, ENC_KEY)));
        bluetooth.uartWriteBuffer(Buffer.fromUTF8('\n'));
    }
    basic.pause(2000);
});