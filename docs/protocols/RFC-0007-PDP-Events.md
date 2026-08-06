# ⚡ RFC-0007 — PDP SEMANTIC EVENTS SPECIFICATION
**Category**: Standards Track  
**Protocol Version**: 1.0  

---

## 1. SEMANTIC EVENT TAXONOMY

PDP standardizes event topics into hierarchical semantic namespaces: `domain.entity.action`.

### Mandatory Event Catalog:
- `pet.sleep.started` / `pet.sleep.finished`
- `pet.food.intake` / `pet.water.intake`
- `pet.vomit.detected` / `pet.fall.detected` / `pet.anxiety.detected`
- `guardian.voice.played` / `music.started` / `music.finished`
- `camera.motion.detected` / `camera.person.detected` / `camera.pet.detected`
- `device.online` / `device.offline` / `device.low_battery`

---

## 2. EVENT SCHEMA PAYLOAD EXAMPLE

```json
{
  "event": "pet.anxiety.detected",
  "version": "1.0",
  "timestamp": 1785835578000,
  "data": {
    "decibel_level": 74,
    "vocalization_type": "pacing_whine",
    "posture_state": "restless_pacing",
    "duration_seconds": 180
  }
}
```

---

## 3. 🔒 PATENT CANDIDATE PO-PAT-PDP-007

- **Title**: Hierarchical Biological & Environmental Semantic Event Model for Companion Animals.
- **Problem**: Generic IoT event models lack domain representation for animal physiology and behavioral anomalies.
- **Innovation**: A semantic event taxonomy framing multi-modal sensor detections into structured biological story primitives.
- **Claims**: A method for encoding animal behavior events into standardized semantic topics.
