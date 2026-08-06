# 🏛️ PROJECT ONE — ARCHITECTURE CONSOLIDATION & BACKBONE REVIEW
## Document ID: PO-0220
### Deep-Dive Architectural Teardown & Hardening: PR-011 through PR-014
**Version**: 1.0  
**Classification**: Enterprise Architecture & Engineering Review  
**Scope**: Cognitive Timeline (PR-011), LCM Runtime (PR-012), CRE Engine (PR-013), and CAE Action Engine (PR-014).

---

## 🎯 EXECUTIVE DIRECTIVE

Project One has successfully constructed its core **Cognitive Backbone**:

```
[Sensors] ──► [PR-011: Timeline] ──► [PR-012: LCM Runtime] ──► [PR-013: CRE Engine] ──► [PR-014: CAE Action Engine]
                   ▲                                                                                  │
                   └───────────────────── (Closed Loop Feedback Event) ───────────────────────────────┘
```

Before adding higher abstractions (Memory, Long-Term Goals, Complex Learning), **this backbone must be audited, decoupled, and stress-tested against infinite loops and high-throughput bottlenecks**.

---

## 🔍 THE 6 CRITICAL ARCHITECTURAL QUESTIONS: AUDIT & RESOLUTION

### ❓ Question 1: Could the Closed Event Feedback Loop Cause Infinite Recursion?
* **PANEL AUDIT**: **CRITICAL RISK IDENTIFIED.**
* **Analysis**: When CAE executes an action (e.g., `PLAY_GUARDIAN_VOICE`), it writes a new `TimelineEvent` with `event_type = 'unusual'`. If `LivingCompanionModelService` listens to all timeline events and `CognitiveReasoningEngine` re-evaluates rules on every event, a loop occurs:
  `Action Executed ➔ New Event Created ➔ LCM Updated ➔ CRE Triggers Same Action ➔ New Event Created... (INFINITE LOOP)`
* **MANDATED HARDENING SOLUTION**:
  1. **Event Classification Filter**: Classify all action-generated events with `source = 'automation'` or `category = 'reasoning'`.
  2. **CRE Loop Suppression Guard**: CRE rules MUST ignore events where `source === 'automation'` from triggering automated actions.
  3. **Action Debounce & Cooldown Window**: Enforce a strict **60-second cooldown** per `(pet_id, action_type)` pair in `ActionEngine`.

---

### ❓ Question 2: Is the Action Engine Overly Coupled to the Cognitive Reasoning Engine (CRE)?
* **PANEL AUDIT**: **MODERATE COUPLING DETECTED.**
* **Analysis**: `ActionEngine` should not depend directly on internal CRE calculation logic, nor should CRE hardcode hardware execution parameters.
* **MANDATED HARDENING SOLUTION**:
  * Introduce an explicit **ActionIntent** contract layer between CRE and CAE:
    ```ts
    export interface ActionIntent {
      pet_id: string;
      intent_type: string; // e.g. "HYDRATION_REMINDER"
      priority: "low" | "medium" | "high" | "critical";
      context: Record<string, unknown>;
    }
    ```
  * CRE emits `ActionIntent`. CAE receives the intent, resolves Guardian permissions/approvals, and maps the intent to device plugins out-of-band.

---

### ❓ Question 3: Is the Living Companion Model (LCM) Truly Isolated?
* **PANEL AUDIT**: **ISOLATED ON READ-SIDE, NEEDS WRITE-SIDE DECOUPLING.**
* **Analysis**: Currently, pages read LCM state cleanly via `LivingCompanionModelService.getCurrentState(petId)`. However, if state recomputation happens synchronously during an API request, response times suffer.
* **MANDATED HARDENING SOLUTION**:
  * **Asynchronous Out-of-Band Worker Pattern**: State recomputation (`computeStateFromEvent`) must run asynchronously in background tasks or micro-batch queues.
  * **Read-Side Cache Guarantee**: Server Components and UI views perform 100% read-only queries against `living_companion_models` table; zero state calculation occurs on render.

---

### ❓ Question 4: Do Plugins Follow a Rigorous, Consistent Contract Interface?
* **PANEL AUDIT**: **CONTRACT STANDARDIZATION REQUIRED.**
* **Analysis**: `DevicePlugin` defines `supports()` and `execute()`, but lacks standard handling for hardware timeouts, connection retries, and offline fallback queues.
* **MANDATED HARDENING SOLUTION**:
  * Extend `DevicePlugin` interface with timeout and retry standards:
    ```ts
    export interface DevicePlugin {
      name: string;
      timeoutMs: number;
      retryCount: number;
      supports(actionType: string): boolean;
      execute(action: CompanionAction): Promise<ExecutionResult>;
      health(): Promise<{ status: "online" | "offline" | "degraded" }>;
      capabilities(): string[];
    }
    ```

---

### ❓ Question 5: Are There Contention Bottlenecks for Thousands of Events Per Minute?
* **PANEL AUDIT**: **HIGH-THROUGHPUT BOTTLENECK IDENTIFIED.**
* **Analysis**: 1,000 cameras sending 30fps video frames directly to Supabase Postgres will exhaust connection pools and trigger RLS memory locks.
* **MANDATED HARDENING SOLUTION**:
  1. **Edge State Transition Filtering**: Cameras send telemetry ONLY on *state transitions* (e.g., `sleeping ➔ awake`), reducing event volume by 98%.
  2. **Micro-Batch Ingestion**: `/api/events` supports batch ingestion (`InsertTables<"pet_events">[]`), allowing edge nodes to buffer events in local SQLite and flush every 5 seconds.

---

### ❓ Question 6: Should We Consolidate and Test with Real Hardware Before Adding New Abstractions?
* **PANEL AUDIT**: **YES. ABSOLUTE HIGHEST STRATEGIC PRIORITY.**
* **Analysis**: Adding "Memory", "Goals", or "Complex Learning" before validating the core loop with physical RTSP cameras, BLE collars, and Smart Bed sensors will compound technical debt.
* **MANDATED ROADMAP DECISION**:
  * Freeze new cognitive abstraction layers.
  * **Consolidate PR-011 through PR-014** into a bulletproof production backbone.
  * Validate end-to-end telemetry loop with real hardware in 100 pilot homes.

---

## 🛠️ CONSOLIDATED BACKBONE HARDENING PLAYBOOK

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HARDENING PLAYBOOK: PR-011 TO PR-014                                       │
├───────────────────────────────────┬─────────────────────────────────────────┤
│ 1. Loop Suppression Guard         │ Suppress CRE rules for source='automation'│
├───────────────────────────────────┼─────────────────────────────────────────┤
│ 2. Cooldown Window (60s)          │ Prevent duplicate actions within 60s    │
├───────────────────────────────────┼─────────────────────────────────────────┤
│ 3. ActionIntent Decoupling        │ Decouple CRE reasoning from CAE plugins │
├───────────────────────────────────┼─────────────────────────────────────────┤
│ 4. Read-Only UI Render            │ Zero compute during Server Component    │
├───────────────────────────────────┼─────────────────────────────────────────┤
│ 5. Plugin Timeout (5000ms)        │ Standardize plugin timeout and retries │
└───────────────────────────────────┴─────────────────────────────────────────┘
```

---

**Approved by the Enterprise Architecture Review Board — August 2026.**
