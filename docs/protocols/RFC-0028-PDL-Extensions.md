# 🔌 RFC-0028 — PDL EXTENSIONS & CUSTOM VENDORS SPECIFICATION
**Category**: Standards Track  
**Language Version**: 1.0  

---

## 1. VENDOR EXTENSION NAMESPACING

Third-party manufacturers add custom capabilities using vendor namespaces: `ext.<vendor_id>.<capability_name>`:

```json
{
  "extensions": {
    "ext.acme_pet.laser_pointer": {
      "patterns": ["circular", "random_chase"],
      "speed_levels": [1, 2, 3]
    }
  }
}
```

---

## 2. 🔒 PATENT CANDIDATE PO-PAT-PDL-009

- **Title**: Namespaced Extensibility Framework for Non-Standard Third-Party Hardware Actuators.
- **Problem**: Proprietary 3rd-party pet toys cannot self-describe novel features without corrupting standard schema validators.
- **Innovation**: Cryptographically isolated vendor extension namespaces allowing dynamic registration of custom hardware primitives.
- **Claims**: A method for namespaced capability extensibility in pet hardware profiles.
