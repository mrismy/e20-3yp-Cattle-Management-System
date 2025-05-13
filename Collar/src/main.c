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
#include "heartRate.h"
#include "esp_timer.h"

int counter = 0;
// Data structure for sensor readings
typedef struct
{
    int heart_rate;
    float temperature;
} sensor_data_t;

sensor_data_t shared_data;
sensor_data_t copy;
SemaphoreHandle_t data_mutex;

// Functions
float readTemperature(void);
int readHeartRate(void);
void readGps(float *, float *);
void createJsonDoc(char **);
void print_uint16_array(const uint16_t *, size_t, const char *);
void read_heartrate_task(void *);
void lora_send_task(void *);
void read_temp_task(void *);

void read_heartrate_task(void *pvParameters) {
    max30102Sensor_init();
    
    // Config
    const uint8_t RATE_SIZE = 4;       // Moving average window
    const uint16_t SAMPLES_PER_READ = 15; // FIFO size
    uint8_t rates[RATE_SIZE];
    uint8_t rateSpot = 0;
    int64_t lastBeat = 0;
    int beatAvg = 0, last_beatAvg = 0;
    
    // Buffers
    uint16_t red[SAMPLES_PER_READ], ir[SAMPLES_PER_READ];
    int64_t sample_times[SAMPLES_PER_READ];

    while (1) {
        // 1. Read FIFO (15 samples @ 400Hz = 37.5ms of data)
        readRaw(red, ir);
        int64_t batch_start = esp_timer_get_time(); // us (micro)
        
        // 2. Process each sample with timestamp
        for (size_t i = 0; i < SAMPLES_PER_READ; i++) {
            sample_times[i] = batch_start + (i * 2500); // 2.5ms spacing (100Hz)
            
            if (checkForBeat(ir[i])) {
                int64_t delta = (sample_times[i] - lastBeat) / 1000; // ms
                lastBeat = sample_times[i];
                
                if (delta > 0) {  // Prevent division by zero
                    float bpm = 60000.0 / delta;  // Correct BPM calculation
                    if (bpm > 20 && bpm < 255) {
                        rates[rateSpot++] = (uint8_t)bpm;
                        rateSpot %= RATE_SIZE;
                        
                        // Update average
                        beatAvg = 0;
                        for (uint8_t x = 0; x < RATE_SIZE; x++) beatAvg += rates[x];
                        beatAvg /= RATE_SIZE;
                    }
                }
            }

            if (ir[i]<500)
            {
                beatAvg = 0;
            }
            
        }
        
        // 3. Thread-safe data update (only if changed)
        if (beatAvg != last_beatAvg) {
            xSemaphoreTake(data_mutex, portMAX_DELAY);
            shared_data.heart_rate = beatAvg;
            xSemaphoreGive(data_mutex);
            last_beatAvg = beatAvg;
        }
        printf("Heart Rate: %d Temp: %.2f\n",shared_data.heart_rate,shared_data.temperature);

        // 4. Delay until next batch (adjust for your actual FIFO refill rate)
        vTaskDelay(37.5 / portTICK_PERIOD_MS); // ~100Hz effective
    }
}

void lora_send_task(void *pvParameters)
{   
    // Initialize Lora
    ESP_LOGI("LORA", "Initializing LoRa...");

    if (!lora_init())
    {
        ESP_LOGE("LORA", "Failed to initialize LoRa!");
        return;
    }
    lora_set_frequency(433E6); // Set frequency to 433 MHz (or 868E6 / 915E6 based on your module)
    lora_explicit_header_mode();
    lora_set_spreading_factor(7);
    lora_enable_crc();

    while (true)
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

void read_temp_task(void *pvParameter){
    // Initialize the temperature sensor
    ds18b20_init_sensor();
    float temperature = 0;
    shared_data.temperature = 0;
    while (true)
    {   
        float temp;
        getTemperature(&temp);
        if (temp != temperature)
        {
            xSemaphoreTake(data_mutex,portMAX_DELAY);
            shared_data.temperature = temp;
            xSemaphoreGive(data_mutex);
            temperature = temp;
        }
        
    }
    
}

void app_main(void *pvParamaters)
{
    init_uart();
    data_mutex = xSemaphoreCreateMutex();
    if (data_mutex == NULL)
    {
        ESP_LOGE("MAIN", "Failed to create mutex!");
        return;
    }
    xTaskCreate(read_temp_task, "ds18b20_task", 4096, NULL, 2, NULL);
    xTaskCreatePinnedToCore(read_heartrate_task, "HeartRate_Task", 4096, NULL, 2, NULL, 0);
    xTaskCreatePinnedToCore(lora_send_task, "LoRa_Task", 4096, NULL, 1, NULL, 1);

    ESP_LOGI("ESP32", "Tasks created, system running");
}

// Create Json Object
void createJsonDoc(char **jsonStr)
{
    // Read the sensor data
    xSemaphoreTake(data_mutex, portMAX_DELAY);
    int id = counter;
    float temp = shared_data.temperature;
    int hr = shared_data.heart_rate;
    float lat, lon;
    readGps(&lat, &lon);
    xSemaphoreGive(data_mutex);

    // Prepare Json Doc
    char temp_str[10], lat_str[10], lon_str[10], hr_str[10], dev_id[5];
    cJSON *doc = cJSON_CreateObject();

    // Format to 2 decimal places as strings
    snprintf(dev_id, sizeof(dev_id), "%d", id);
    snprintf(temp_str, sizeof(temp_str), "%.2f", temp);
    snprintf(hr_str, sizeof(hr_str), "%d", hr);
    snprintf(lat_str, sizeof(lat_str), "%.2f", lat);
    snprintf(lon_str, sizeof(lon_str), "%.2f", lon);

    // Add strings to JSON (not numbers)
    cJSON_AddStringToObject(doc, "i", dev_id);
    cJSON_AddStringToObject(doc, "t", temp_str);
    cJSON_AddStringToObject(doc, "h", hr_str);
    cJSON_AddStringToObject(doc, "la", lat_str);
    cJSON_AddStringToObject(doc, "lo", lon_str);

    // Compact Json
    *jsonStr = cJSON_PrintUnformatted(doc);

    // Clean up
    cJSON_Delete(doc);

    // MOCKING DIFFERENT 10 DEVICES
    counter++;
    if (counter > 10)
    {
        counter = 0;
    }
}

void print_uint16_array(const uint16_t *arr, size_t len, const char *label)
{
    printf("%s: ", label);
    for (size_t i = 0; i < len; i++)
    {
        printf("%u ", arr[i]);
    }
    printf("\n");
}

// Mock sensor data (replace with actual sensor reads)
float readTemperature() { return 25.4; }
int readHeartRate() { return 72; }
void readGps(float *lat, float *lon)
{
    *lat = 7.25448;
    *lon = 80.59145;
}