def on_bluetooth_connected():
    basic.show_icon(IconNames.HEART)

def on_bluetooth_disconnected():
    basic.show_icon(IconNames.ANGRY)

def on_button_pressed_a():
    value = pins.analog_read_pin(AnalogPin.P0)
    bluetooth.uart_write_value("SOLAR", value)

bluetooth.start_uart_service()
bluetooth.on_bluetooth_disconnected(on_bluetooth_disconnected)
bluetooth.on_bluetooth_connected(on_bluetooth_connected)
input.on_button_pressed(Button.A, on_button_pressed_a)

