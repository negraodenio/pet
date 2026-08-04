# 📋 PO-0006 — PET DESCRIPTION LANGUAGE (PDL)

> **Document ID**: PO-0006  
> **Category**: Protocols  
> **Status**: Biological Data Schema  

---

## 1. OBJECTIVE

PDL (Pet Description Language) is the universal biological schema representing a companion animal's identity, physical metrics, medical history, and behavioral baseline.

---

## 2. SCHEMA STRUCTURE

```json
{
  "pdl_version": "1.0",
  "pet_id": "pet_lola",
  "identity": {
    "name": "Lola",
    "species": "dog",
    "breed": "Golden Retriever",
    "birth_date": "2022-04-12",
    "sex": "spayed_female",
    "weight_kg": 31.5
  },
  "baselines": {
    "sleep_hours_target": 12.5,
    "water_intake_ml_target": 450,
    "activity_hours_target": 4.2,
    "resting_heart_rate_bpm": 72
  }
}
```
