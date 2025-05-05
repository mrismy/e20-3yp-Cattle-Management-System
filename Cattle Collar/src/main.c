#include "uart_max30102.h"
#include "lora.h"
#include "max30102_sensor.h"
#include "ds18b20_sensor.h"

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#include "string.h"
#include "cJSON.h"
#include <freertos/projdefs.h>

int counter = 0;

// Functions
float readTemperature(void);
int readHeartRate(void);
void readGps(float *, float *);
void createJsonDoc(char **);

// void print_uint16_array(const uint16_t *arr, size_t len, const char *label)
// {
//     printf("%s: ", label);
//     for (size_t i = 0; i < len; i++)
//     {
//         printf("%u ", arr[i]);
//     }
//     printf("\n");
// }

// #define RX_BUF_SIZE 256
// uint8_t buffer[RX_BUF_SIZE];

// void rx_task(void *pvParameters) {
//     while (1) {
//         if (lora_received()) {
//             int len = lora_receive_packet(buffer, RX_BUF_SIZE);
//             buffer[len] = '\0';  // Null-terminate the string
//             printf("Received: %s\n", buffer);
//         }
//         vTaskDelay(pdMS_TO_TICKS(100));  // Small delay
//     }
// }

void app_main()
{
    // xTaskCreate(ds18b20_task, "ds18b20_task", 4096, (void*)DS18B20_GPIO, 5, NULL);
    // max30102Sensor_init();
    // uint16_t red[16];
    // uint16_t ir[16];
    // The app_main function will stay running, so other tasks can execute
    // while (1)
    // {
    //     readReadRaw(red,ir);
    //     print_uint16_array(red,16,"RED");
    //     // Main loop, you can also add other tasks here if needed
    //     vTaskDelay(pdMS_TO_TICKS(1000));
    // }
    // ds18b20_init_sensor((gpio_num_t)4);

    // Initialize Lora
    ESP_LOGI("LORA", "Initializing LoRa...");

    if (!lora_init())
    {
        ESP_LOGE("LORA", "Failed to initialize LoRa!");
        return;
    }

    // Optional configurations
    lora_set_frequency(433E6); // Set frequency to 433 MHz (or 868E6 / 915E6 based on your module)
    // lora_set_sync_word(0x34);
    // lora_set_spreading_factor(7);
    // lora_set_bandwidth(125E3);
    // lora_set_coding_rate(5); // 4/5
    lora_explicit_header_mode();
    lora_set_spreading_factor(7);
    lora_enable_crc();

    // Optional: loop to send repeatedly
    while (1)
    {
        char *msg;
        createJsonDoc(&msg);
        if (msg != NULL)
        {
            // Check LoRa packet size limit (e.g., 255 bytes)
            if (strlen(msg) <= 255)
            {   
                lora_send_packet((uint8_t *)msg, strlen(msg));
                ESP_LOGI("LORA", "Sent: %s (len=%d)", msg, strlen(msg));
            }
            else
            {
                ESP_LOGE("LORA", "JSON too large!");
            }

            free(msg); // Free allocated memory!
        }
        vTaskDelay(pdMS_TO_TICKS(3000)); // Give some time before sending
    }
}

// void app_main(void) {
//     // Initialize SPI + LoRa
//     // spi_init();           // your custom SPI init
//     lora_init();          // Init the LoRa chip

//     lora_set_frequency(433E6);
//     lora_set_spreading_factor(7);
//     lora_set_bandwidth(125E3);
//     lora_set_coding_rate(5);
// lora_enable_crc();
//     lora_explicit_header_mode();
//     lora_idle();          // Make sure it's not in sleep

//     // Create receive task
//     xTaskCreate(rx_task, "rx_task", 2048, NULL, 5, NULL);
//     vTaskDelay(pdMS_TO_TICKS(1000));
// }

// Create Json Object
void createJsonDoc(char **jsonStr)
{
    // Read the sensor data
    int id = counter;
    float temp = readTemperature();
    int hr = readHeartRate();
    float lat, lon;
    readGps(&lat, &lon);

    // Prepare Json Doc
    char temp_str[10], lat_str[10], lon_str[10], hr_str[10], dev_id[5];
    cJSON *doc = cJSON_CreateObject();
    
    // Format to 2 decimal places as strings
    snprintf(dev_id,sizeof(dev_id),"%d", id);
    snprintf(temp_str, sizeof(temp_str), "%.2f", temp);
    snprintf(hr_str, sizeof(hr_str), "%d", hr);
    snprintf(lat_str, sizeof(lat_str), "%.2f", lat);
    snprintf(lon_str, sizeof(lon_str), "%.2f", lon);

    // Add strings to JSON (not numbers)
    cJSON_AddStringToObject(doc,"i",dev_id);
    cJSON_AddStringToObject(doc, "t", temp_str);
    cJSON_AddStringToObject(doc,"h",hr_str);
    cJSON_AddStringToObject(doc, "la", lat_str);
    cJSON_AddStringToObject(doc, "lo", lon_str);

    // Compact Json
    *jsonStr = cJSON_PrintUnformatted(doc);

    // Clean up
    cJSON_Delete(doc);

    // MOCKING DIFFERENT DEVICES
    counter++;
}

// Mock sensor data (replace with actual sensor reads)
float readTemperature() { return 25.4; }
int readHeartRate() { return 72; }
void readGps(float *lat, float *lon)
{
    *lat = 12.34;
    *lon = 56.78;
}