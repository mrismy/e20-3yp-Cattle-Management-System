idf_component_register(
    SRCS max30102.c uart_max30102.c max30102_sensor.c
    INCLUDE_DIRS .
    REQUIRES driver spi_flash esp_adc
)