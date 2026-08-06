# 📋 RFC-0021 — PDL CORE SYNTAX & FORMAT SPECIFICATION
**Category**: Standards Track  
**Language Version**: 1.0  

---

## 1. MANDATORY METADATA DESCRIPTOR SCHEMA (JSON EXAMPLE)

```json
{
  "$schema": "https://pdl.projectone.ai/v1/pdl-descriptor.json",
  "pdl_version": "1.0",
  "device": {
    "name": "Living Room Vision Device Pro",
    "manufacturer": "Project One Hardware",
    "model": "P1-CAM-4K",
    "hardware_version": "v2.1",
    "firmware_version": "2.1.0-prod",
    "protocol_version": "1.0",
    "serial_number": "SN-CAM-8F4299"
  },
  "power": {
    "source": "mains_with_battery_backup",
    "battery_percentage": 100,
    "power_saving_modes": ["sleep_sensor_only", "full_vision"]
  },
  "connectivity": {
    "primary": "wifi_6",
    "secondary": "ble_5.3",
    "thread_supported": true
  }
}
```

---

## 2. CBOR BINARY SERIALIZATION SPECIFICATION

For resource-constrained microcontrollers (ESP32), PDL descriptors serialize into **CBOR (Concise Binary Object Representation)** to reduce payload size by up to $70\%$.

---

## 3. 🔒 PATENT CANDIDATE PO-PAT-PDL-002

- **Title**: Dual JSON/CBOR Semantic Schema Serialization for Constrained Edge Bio-Sensors.
- **Problem**: Large JSON device descriptors overwhelm RAM-constrained microcontroller sensors (ESP32/Nordic).
- **Innovation**: Bi-directional zero-loss translation between high-level JSON PDL schemas and compact CBOR binary tokens.
- **Claims**: A method for binary descriptor serialization on constrained biometric hardware.
