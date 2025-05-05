#include "driver/gpio.h"

/**
 * Initiallize 
 * @param pin GPIO PIN Number of DS18B20
 */
void ds18b20_init_sensor(gpio_num_t pin);

/**
 * Read the temperature (wait for 800 ms)
 */
float getTemperature();