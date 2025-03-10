bluetooth.start_uart_service()

VOLTAGE_REF = 3.3  # Reference voltage of micro:bit
ADC_RESOLUTION = 1023  # 10-bit ADC resolution
LOAD_RESISTANCE = 10  # Assume a 10-ohm resistive LOAD_RESISTANCE

def on_bluetooth_connected():
    basic.show_icon(IconNames.HEART)

bluetooth.on_bluetooth_connected(on_bluetooth_connected)

# def on_uart_data_received():
#     if Delimiters == "heart":
#         basic.show_icon(IconNames.HEART)
#     else:
#         basic.show_icon(IconNames.ASLEEP)
# bluetooth.on_uart_data_received(serial.delimiters(Delimiters.NEW_LINE), on_uart_data_received)

while True:
    analog_value = pins.analog_read_pin(AnalogPin.P0)
    voltage = (analog_value / ADC_RESOLUTION) * VOLTAGE_REF
    power = (voltage ** 2) / LOAD_RESISTANCE
    bluetooth.uart_write_value("SOLAR", power)
    basic.pause(5000)