#include "uart_max30102.h"
#include "lora.h"
#include "max30102_sensor.h"
#include "ds18b20_sensor.h"
#include "esp_sleep.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#include "string.h"
#include "cJSON.h"
#include <freertos/projdefs.h>
#include "heartRate.h"
#include "esp_timer.h"
#include <sys/time.h>

int settimeofday(const struct timeval *tv, const struct timezone *tz);
#define DEVICE_ID 88
// Data structure for sensor readings
typedef struct
{
    int heart_rate;
    float temperature;
} sensor_data_t;

sensor_data_t shared_data;
sensor_data_t copy;
SemaphoreHandle_t data_mutex;

// STATE machines
typedef enum
{
    RX_MODE,          // LoRa in RX_MODE
    READ_SENSOR_MODE, // Request sensor data
    TX_MODE,          // LoRa in TX_MODE
    SETUP_MODE,       // Setup next wakeup time before sleep
    SLEEP
} app_mode_t;

typedef enum
{
    EVENT_START,
    EVENT_GLOBAL_TIMEOUT,
    EVENT_SYNC_TIME,
    EVENT_DATA_REQ,
    EVENT_READ_SENSORS_SUCCESS,
    EVENT_TX_COMPLETE,
    EVENT_ACK,
    EVENT_ACK_TIMEOUT,
    EVENT_ALLOC_TIMEOUT
} app_event_t;

typedef struct
{
    uint32_t unix;
    uint8_t alloc_time;
} sync_time_config_t;

typedef struct
{
    TaskHandle_t heart_rate_handle;
    TaskHandle_t temp_handle;
    TaskHandle_t gps_handle;
} tasks_handle_t;

static tasks_handle_t tasks_handle = {
    .heart_rate_handle = NULL,
    .temp_handle = NULL,
    .gps_handle = NULL};

// Functions
float readTemperature(void);
int readHeartRate(void);
void readGps(float *, float *);
void createJsonDoc(char **);
void print_uint16_array(const uint16_t *, size_t, const char *);
void read_heartrate_task(void *);
void lora_send_task(void *);
void read_temp_task(void *);
void lora_receive_task(void *);
void setupTime();
void configSyncTime(void *);
void lora_peek_device_id(uint16_t *);

bool sync_status = false;

void configSyncTime(void *pvParam)
{
    uint8_t rx_buffer[256];
    uint32_t unix;
    uint16_t alloc_time;
    uint8_t retry_count;
    uint8_t *sync_status_mask;
    uint8_t mode;

    while (1)
    {
        lora_peek_header(&mode, 1);
        if (mode != 0xA0)
        {
            vTaskDelay(pdMS_TO_TICKS(20));
            lora_receive(); // Listen to next packet
            continue;
        }

        // Receive packet with timeout (non-blocking alternative available)
        int bytes_received = lora_receive_packet(rx_buffer, sizeof(rx_buffer)); // Leave space for null terminator

        ESP_LOGI("TIME_CONFIG", "Received buffer size: %d", bytes_received);
        ESP_LOG_BUFFER_HEXDUMP("RX", rx_buffer, bytes_received, ESP_LOG_INFO);
        // memcpy(&unix, rx_buffer, 4);
        unix = rx_buffer[1] | (rx_buffer[2] << 8) | (rx_buffer[3] << 16) | (rx_buffer[4] << 24);
        alloc_time = rx_buffer[9] | (rx_buffer[10] << 8);
        retry_count = rx_buffer[11];
        sync_status_mask = &rx_buffer[12];

        ESP_LOGI("TIME_CONFIG", "UNIX: %d ALLOC_TIME: %d RETRY: %d", (int)unix, (int)alloc_time, (int)retry_count);

        // If device is not synced
        if (!sync_status)
        {
            ESP_LOGI("TIME CONFIG", "current time: %d, allocated time: %d", (int)unix, (int)alloc_time * DEVICE_ID);

            uint8_t byteMask = DEVICE_ID / 8;
            uint8_t bitMask = DEVICE_ID % 8;

            sync_status = ((sync_status_mask[byteMask] & (1 << bitMask)) != 0);
            ESP_LOGI("SYNC", "sync_status_mask[1] = %x", sync_status_mask[byteMask]);
            ESP_LOGI("SYNC", "Device %d status: %s",
                     DEVICE_ID,
                     sync_status ? "SYNCED" : "UNSYNCED");
            if (unix > 0)
            {
                setupTime(unix);
                uint16_t ack = (0xAA << 8) | DEVICE_ID;
                vTaskDelay(pdMS_TO_TICKS(10 * DEVICE_ID)); // Send Ack After 1 sec
                lora_send_packet((uint8_t *)&ack, sizeof(ack));
                ESP_LOGI("TIME_CONFIG", "Ack sent");
            }

            vTaskDelay(pdMS_TO_TICKS(200));
            lora_peek_header(&mode, 1);
        }
        else
        {
            ESP_LOGI("TIME_CONFIG", "Already Acked");
            ESP_LOGI("TIME_CONFIG", "Going to deep sleep");
            esp_sleep_enable_timer_wakeup(alloc_time * DEVICE_ID * 1000000);
            esp_deep_sleep_start();
        }
        lora_receive(); // Listen to next packet
    }
}

void read_sensors_task(void *pvParam)
{
    uint8_t rx_buffer[256];
    uint16_t device_Id;

    xTaskCreate(read_heartrate_task, "heart_rate", 4096, NULL, 23, &tasks_handle.heart_rate_handle);
    xTaskCreate(read_temp_task, "temp", 2048, NULL, 23, &tasks_handle.temp_handle);

    int bytes_received = lora_receive_packet(rx_buffer, sizeof(rx_buffer));
    device_Id = rx_buffer[1] | (rx_buffer[2] << 8);
    ESP_LOGI("SENSOR_MODE", "Current request Id: %d", (int)device_Id);

    vTaskDelay(pdMS_TO_TICKS(10000)); // Let the sensor get the reading for 10 secs

    do
    {
        lora_receive();
        bytes_received = lora_receive_packet(rx_buffer, sizeof(rx_buffer));
        device_Id = rx_buffer[1] | (rx_buffer[2] << 8);
        vTaskDelay(pdMS_TO_TICKS(10));
    } while (device_Id < DEVICE_ID);

    ESP_LOGI("SENSOR_MODE", "Current request Id: %d", (int)device_Id);
    ESP_LOGI("SENSOR_MODE", "Heart Rate: %d Temperature: %.2f", shared_data.heart_rate, shared_data.temperature);

    xTaskCreate(lora_send_task, "LoRa_Task", 4096, NULL, 1, NULL);

    vTaskDelete(tasks_handle.heart_rate_handle);
    vTaskDelete(tasks_handle.temp_handle);
}

void setupTime(uint32_t time_stamp)
{

    time_t seconds = (time_t)time_stamp;
    long microseconds = 0;

    struct timeval tv = {
        tv.tv_sec = seconds,
        tv.tv_usec = microseconds};

    settimeofday(&tv, NULL);
    time_t now;
    time(&now);
    ESP_LOGI("TIME", "System time set to: %s", ctime(&now));
}

void read_heartrate_task(void *pvParameters)
{
    max30102Sensor_init();

    ESP_LOGI("SENSOR_MODE", "Reading Heart Rate");
    // Config
    const uint8_t RATE_SIZE = 4;          // Moving average window
    const uint16_t SAMPLES_PER_READ = 15; // FIFO size
    uint8_t rates[RATE_SIZE];
    uint8_t rateSpot = 0;
    int64_t lastBeat = 0;
    int beatAvg = 0, last_beatAvg = 0;

    // Buffers
    uint16_t red[SAMPLES_PER_READ], ir[SAMPLES_PER_READ];
    int64_t sample_times[SAMPLES_PER_READ];

    while (1)
    {
        // 1. Read FIFO (15 samples @ 400Hz = 37.5ms of data)
        readRaw(red, ir);
        int64_t batch_start = esp_timer_get_time(); // us (micro)

        // 2. Process each sample with timestamp
        for (size_t i = 0; i < SAMPLES_PER_READ; i++)
        {
            sample_times[i] = batch_start + (i * 2500); // 2.5ms spacing (100Hz)

            if (checkForBeat(ir[i]))
            {
                int64_t delta = (sample_times[i] - lastBeat) / 1000; // ms
                lastBeat = sample_times[i];

                if (delta > 0)
                {                                // Prevent division by zero
                    float bpm = 60000.0 / delta; // Correct BPM calculation
                    if (bpm > 20 && bpm < 255)
                    {
                        rates[rateSpot++] = (uint8_t)bpm;
                        rateSpot %= RATE_SIZE;

                        // Update average
                        beatAvg = 0;
                        for (uint8_t x = 0; x < RATE_SIZE; x++)
                            beatAvg += rates[x];
                        beatAvg /= RATE_SIZE;
                    }
                }
            }

            if (ir[i] < 500)
            {
                beatAvg = 0;
            }
        }

        // 3. Thread-safe data update (only if changed)
        if (beatAvg != last_beatAvg)
        {
            xSemaphoreTake(data_mutex, portMAX_DELAY);
            shared_data.heart_rate = beatAvg;
            xSemaphoreGive(data_mutex);
            last_beatAvg = beatAvg;
        }
        // printf("Heart Rate: %d Temp: %.2f\n", shared_data.heart_rate, shared_data.temperature);

        // 4. Delay until next batch (adjust for your actual FIFO refill rate)
        vTaskDelay(37.5 / portTICK_PERIOD_MS); // ~100Hz effective
    }
}

void lora_receive_task(void *pvParameters)
{
    lora_receive();

    while (1)
    {
        uint8_t mode;
        uint16_t deviceId;

        if (lora_peek_header(&mode, 1))
        {
            ESP_LOGI("RX", "Header: 0x%X", mode);
            lora_peek_device_id(&deviceId);
            ESP_LOGI("LORA PEEK ID", "0x%02X", (int)deviceId);
            switch (mode)
            {
            case 0xA0: // Time configuration
                xTaskCreate(configSyncTime, "config_time_setup", 4096, NULL, 24, NULL);
                ESP_LOGI("RX_MODE", "Deleting lora receive task!");
                vTaskDelete(NULL);
                break;

            case 0xB0: // Read sensor task
                if ((int)deviceId == DEVICE_ID - 1)
                {
                    xTaskCreate(read_sensors_task, "read_sensor", 4096, NULL, 24, NULL);
                    ESP_LOGI("RX_MODE", "Deleting lora receive task!");
                    vTaskDelete(NULL);
                }
                break;
            default:
                break;
            }
        }

        lora_receive();
        vTaskDelay(pdMS_TO_TICKS(10)); // Small delay to prevent CPU hogging
    }
}

void lora_send_task(void *pvParameters)
{
    // Initialize Lora
    // ESP_LOGI("LORA", "Initializing LoRa...");

    // if (!lora_init())
    // {
    //     ESP_LOGE("LORA", "Failed to initialize LoRa!");
    //     return;
    // }
    // lora_set_frequency(433E6); // Set frequency to 433 MHz (or 868E6 / 915E6 based on your module)
    // lora_explicit_header_mode();
    // lora_set_spreading_factor(7);
    // lora_enable_crc();
    ESP_LOGI("LORA_TX_MODE","Preparing to send data....");
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
}

void read_temp_task(void *pvParameter)
{
    // Initialize the temperature sensor
    ds18b20_init_sensor();
    ESP_LOGI("SENSOR_MODE", "Reading Temperature sensor");
    float temperature = 0;
    shared_data.temperature = 0;
    while (true)
    {
        float temp;
        getTemperature(&temp);
        if (temp != temperature)
        {
            xSemaphoreTake(data_mutex, portMAX_DELAY);
            shared_data.temperature = temp;
            xSemaphoreGive(data_mutex);
            temperature = temp;
        }
    }
}

void lora_peek_device_id(uint16_t *deviceId)
{
    uint32_t payload;
    lora_peek_header((uint8_t *)&payload, 3); // read the first 3 bytes without consuming
    *deviceId = (payload >> 8) & 0xFFFF;
    ;
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

    // xTaskCreate(read_temp_task, "ds18b20_task", 4096, NULL, 2, NULL);
    // xTaskCreate(read_heartrate_task, "HeartRate_Task", 4096, NULL, 2, NULL);
    // xTaskCreate(lora_send_task, "LoRa_Task", 4096, NULL, 1, NULL);
    xTaskCreate(lora_receive_task, "lora_rx", 4096, NULL, 24, NULL);

    ESP_LOGI("ESP32", "Tasks created, system running");
}

// Create Json Object
void createJsonDoc(char **jsonStr)
{
    // Read the sensor data
    xSemaphoreTake(data_mutex, portMAX_DELAY);
    int id = DEVICE_ID;
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