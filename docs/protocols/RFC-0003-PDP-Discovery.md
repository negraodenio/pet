# 🔍 RFC-0003 — PDP DISCOVERY SPECIFICATION
**Category**: Standards Track  
**Protocol Version**: 1.0  

---

## 1. DISCOVERY PROTOCOLS

PDP devices advertise their presence locally via three redundant discovery channels:

1. **mDNS / DNS-SD**: Local network service advertising `_pdp._tcp.local.`.
2. **BLE 5.3 Advertising**: Unpaired devices broadcast UUID `0xFD00` with device model and setup state.
3. **Cloud Discovery Fallback**: Devices unable to resolve local mDNS register their IP directly via HTTPS setup endpoint.

---

## 2. mDNS SERVICE ANNOUNCEMENT RECORD

```text
Service Name: Compawion-SmartBed-8F42._pdp._tcp.local.
Port: 8883 (mTLS)
TXT Record:
  v=1.0
  id=dev_bed_8f42
  type=smart_bed
  paired=0
  model=P1-BED-PRO
  fw=2.1.0
```

---

## 3. 🔒 PATENT CANDIDATE PO-PAT-PDP-003

- **Title**: Multi-Channel Hybrid Local/Cloud Device Discovery & Collision Resolution System for Pet Hardware.
- **Problem**: Interference in home Wi-Fi/BLE networks prevents rapid setup of animal monitoring hardware.
- **Innovation**: Simultaneous triple-band mDNS, BLE, and encrypted cloud beacon discovery with automatic collision resolution.
- **Claims**: A method for multi-channel zero-configuration discovery of biometrically paired hardware.
