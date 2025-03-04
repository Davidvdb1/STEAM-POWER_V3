CONNECTED = False

def on_bluetooth_connected():
    CONNECTED = True
    basic.show_icon(IconNames.HEART)

def on_bluetooth_disconnected():
    CONNECTED = False
    basic.show_icon(IconNames.ANGRY)

def sendData():
    if CONNECTED:
        try:
            value = pins.analog_read_pin(AnalogPin.P0)
            bluetooth.uart_write_value("SOLAR", value)
        except:
            pass

bluetooth.start_uart_service()
bluetooth.on_bluetooth_disconnected(on_bluetooth_disconnected)
bluetooth.on_bluetooth_connected(on_bluetooth_connected)
loops.every_interval(5000, sendData)
