#include "ds18B20_sensor.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "onewire.h"
#include "ds18x20.h"
#include "esp_log.h"
#include "driver/gpio.h"

#define DS18B20_GPIO 4 // Your GPIO pin
#define TAG "DS18B20"

// Temperature Sensor Initialization
/**
 *  ESP32-MAX30102
 * @file max30102.c
 *
 * @author
 * Nicola Ferrante
 * email: nicolaferrante20@gmail.com
 *
 *
 * @brief
 * The implemetation of the processing that
 * will read the raw sensor data from the max30102 sensor.
 *

   Unless required by applicable law or agreed to in writing, this
   software is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
   CONDITIONS OF ANY KIND, either express or implied.
*/

gpio_num_t ds18b20_pin;

void ds18b20_init_sensor(gpio_num_t pin)
{
    ds18b20_pin = pin;
    // 1. Configure GPIO (critical step!)
    gpio_reset_pin(pin);
    gpio_set_direction(pin, GPIO_MODE_INPUT_OUTPUT_OD);
    gpio_set_pull_mode(pin, GPIO_PULLUP_ONLY);

    // 2. Verify bus functionality
    if (!onewire_reset(pin))
    {
        ESP_LOGE(TAG, "No devices detected or bus fault");
        return;
    }

    // 3. Scan for devices (optional but recommended)
    onewire_addr_t addr_list[10];
    size_t found;
    ds18x20_scan_devices(pin, addr_list, 10, &found);

    if (found == 0)
    {
        ESP_LOGW(TAG, "No DS18B20 devices found");
    }
    else
    {
        ESP_LOGI(TAG, "Found %d DS18B20 devices", found);
    }
}

// Reading temperature
void ds18b20_task(void *pvParameters)
{
    gpio_num_t pin = (gpio_num_t)pvParameters;
    float temperature;
    onewire_addr_t addr;

    // Initialize
    ds18b20_init_sensor(pin);

    // Find first device (or use DS18X20_ANY for single device)
    onewire_addr_t addr_list[1];
    size_t found;
    ds18x20_scan_devices(pin, addr_list, 1, &found);

    if (found == 0)
    {
        ESP_LOGE(TAG, "No sensors found");
        vTaskDelete(NULL);
    }
    addr = addr_list[0];
}

float getTemperature(){

    float temperature;
    onewire_addr_t addr;

    // Initialize
    // ds18b20_init_sensor(ds18b20_pin);

    // Find first device (or use DS18X20_ANY for single device)
    onewire_addr_t addr_list[1];
    size_t found;
    ds18x20_scan_devices(ds18b20_pin, addr_list, 1, &found);
    addr = addr_list[0];
    
    // Start conversion (non-blocking)
    ds18x20_measure(ds18b20_pin, addr, false);

    // Wait for conversion (750ms for 12-bit resolution)
    vTaskDelay(pdMS_TO_TICKS(800));

    // Read temperature
    esp_err_t res = ds18b20_read_temperature(ds18b20_pin, addr, &temperature);

    return temperature;
}