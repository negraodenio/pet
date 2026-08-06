# 🧠 PROJECT_ONE_CONTEXT.md
**Version**: 1.0  
**Classification**: Permanent System Context File  
**Audience**: AI Architects, Chief Engineers, Systems Analysts  

---

## 1. EXECUTIVE MISSION & PURPOSE

Project One is an enterprise **Companion Intelligence Platform**. Its sole company purpose is to improve and protect the lives of companion animals through trustworthy, non-invasive artificial intelligence.

### Core Mantra
> *"We are not building a product. We are building peace of mind for millions of pet owners."*

### Key Insight
> *"We are not building hardware. We are building a universal language for intelligent pet devices."*

Hardware sensors (cameras, beds, collars, feeders) are ephemeral. Companion intelligence and digital memories are permanent.

---

## 2. OFFICIAL 5-PLATFORM ARCHITECTURE

1. **Project One Brain**: The cognitive neural core composed of 14 specialized Cortices (*Vision, Audio, Sensor, Context, Behavior, Health, Prediction, Reasoning, Action, Learning, Memory, Knowledge, Conversation, Explainability*) orchestrated by **Brain Core**.
2. **Project One Cloud**: High-availability serverless event bus, PostgreSQL multi-tenant data store with strict Row Level Security (`get_user_org_id()`), real-time WebSocket/WebRTC broker.
3. **Project One Connect**: Protocol & abstraction suite comprising **PDP 1.0 (Pet Device Protocol)**, **PDL (Pet Description Language)** JSON schema, and **HAL (Hardware Abstraction Layer)**.
4. **Project One Devices**: Universal sensory matrix (*Vision Device, AI Station Ambient Tablet, Smart Bed with Ballistocardiography BCG vitals, Smart Feeder, Smart Water, Smart Scale, Smart Collar*).
5. **Project One Labs**: Research unit developing patent IP (e.g. PO-PAT-001), veterinary predictive models, and open developer SDKs.

---

## 3. DIGITAL TWIN & COGNITIVE DNA

Every pet possesses an immutable, persistent **Digital Twin**.
- **Individualized Learning**: The AI never learns generic "dogs" or "cats"; it learns each individual companion.
- **Biometric Baselines**: Sleep REM duration, resting heart rate (BCG), water intake ml/day, activity hours, vocalization decibel thresholds, spatial zone preferences.
- **Anomaly Detection**: Z-score deviation scoring triggers the **Autonomous Resolution Engine (ARE)** when $\text{AnomalyScore}(t) > \theta_{\text{alert}}$.
- **Four Memory Tiers**: Short Memory, Daily Memory, Behavior Memory, Lifetime Memory.

---

## 4. AUTONOMOUS RESOLUTION ENGINE (ARE)

```
Observe ──► Understand ──► Reason ──► Act ──► Learn ──► Explain
```
When distress, anxiety, or barking is detected:
1. **Observe**: Sensor/Audio/Vision Cortex flags event.
2. **Understand**: Context Cortex verifies guardian presence.
3. **Reason**: Reasoning Cortex selects low-risk acoustic mitigation.
4. **Act**: Dispatch calming 432 Hz audio or recorded owner voice clip.
5. **Learn**: Monitor 120s response. If posture relaxes, update Cognitive DNA efficacy.
6. **Explain**: Present human-readable story in owner's timeline (*"Lola barked at door. Played calming music. Lola relaxed in 2 mins."*).

---

## 5. IMMUTABLE ARCHITECTURAL PRINCIPLES

1. Architecture before implementation.
2. Platform before product.
3. Events before data.
4. Interfaces before hardware.
5. AI before automation.
6. Everything explainable.
7. Everything observable.
8. Security & Privacy by Design (PostgreSQL RLS).
9. Cloud + Edge Hybrid Strategy.
10. Long-term thinking (2050 horizon).

---

## 6. CURRENT STATUS & REPOSITORY STRUCTURE

- **Architecture Status**: v2.0 Production Codebase (`apps/web` Next.js 16 PWA, Supabase PostgreSQL RLS migrations `00001` & `00002`, OpenRouter AI API streaming).
- **Design System**: Apple Health / Oura / Calm style UI centered around peace of mind, health scores (97 Excellent), and story timelines.
- **GitHub Repository**: `https://github.com/negraodenio/pet.git`

```
/docs
  ├── /00_master/PO-0000_Master_Architecture_Specification.md
  ├── /foundation/PO-0001_Manifesto.md & PO-0002_Vision_2035.md
  ├── /architecture/PO-0003_Enterprise_Architecture.md
  ├── /ai/PO-0004_AI_Brain.md
  ├── /protocols/PO-0005_PDP_1.0.md & PO-0006_PDL.md
  └── /hardware/PO-0007_Hub.md, PO-0008_Tablet.md, PO-0009_Vision.md, PO-0010_Smart_Bed.md
```

---

*PROJECT_ONE_CONTEXT.md — Permanent System Reference.*
