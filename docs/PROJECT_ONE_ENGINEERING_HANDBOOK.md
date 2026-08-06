# Project One Engineering Handbook

**Edition:** Final 1.0
**Status:** Official engineering policy
**Audience:** Every Project One engineer, technical leader, contractor, and production operator
**Applies to:** Cloud, web, device integrations, edge runtime, infrastructure, security, data, and developer tooling

## 1. Purpose And Authority

This handbook is the operating manual for Project One engineering. It consolidates the approved architecture, Alpha Gate hardening program, engineering organization blueprint, and engineering excellence standards into enforceable practice.

The following are not reopened by this handbook:

- The architecture.
- The approved Alpha Gate backlog.
- Product scope.
- Cognitive domain boundaries.

When this handbook conflicts with an implementation shortcut, the handbook wins. When it conflicts with an approved architecture specification, the architecture specification wins until changed through the governance process in this document.

## 2. Engineering Principles

1. **Safety before convenience.** No release, action, or integration is worth avoidable risk to a companion, guardian, household, or their data.
2. **Evidence before assertion.** Operational, health, reasoning, and action claims must trace to persisted, authorized evidence.
3. **Events before derived state.** Timeline records are the historical source; LCM, CRE, views, and dashboards are derived representations.
4. **Fail closed.** Unknown actions, identities, capabilities, permissions, and inputs are rejected rather than guessed.
5. **Least privilege by default.** Authentication identifies; authorization restricts; RLS enforces tenant boundaries.
6. **Small changes, always releasable.** Main stays deployable. Prefer narrow pull requests, feature flags, and reversible migrations.
7. **Own what you operate.** Every service, table, API, plugin, alert, and runbook has a named team owner.
8. **Make correctness easy.** Standards, generators, tests, and defaults must make the safe path the fast path.
9. **Explicit beats implicit.** Dependencies, state transitions, side effects, feature availability, and compatibility guarantees are documented and typed.
10. **Observability is part of implementation.** If behavior cannot be measured, traced, and diagnosed, it is not production-ready.
11. **Privacy is a product property.** Guardian, household, companion, location, media, and health data require deliberate handling throughout their lifecycle.
12. **Build for ten years.** Optimize for understandable ownership and safe evolution, not temporary cleverness.

## 3. Architecture Principles

Project One uses the approved system flow:

```text
Sensors -> Timeline -> LCM -> CRE -> CAE -> Plugin Dispatcher -> Devices -> Timeline Feedback
```

The following responsibilities are fixed:

| Domain | Responsibility | Must not own |
|---|---|---|
| Timeline | Immutable, ordered observation and feedback history | Current state, action execution, UI state |
| LCM | Current companion state derived from Timeline | Raw device transport, UI rendering |
| CRE | Deterministic reasoning over authorized evidence and current state | Direct device execution |
| CAE | Action lifecycle, policy, approval, and execution coordination | Hardware protocol details |
| Plugins | Hardware and external-system isolation | Reasoning policy, guardian UI |
| Edge Runtime | Secure local capture, buffering, connectivity, and device behavior | Cloud tenancy, cloud database internals |
| Cloud Platform | Identity, tenancy, persistence, API foundations, and reliability | Product-specific presentation |

### 3.1 Non-Negotiable Boundaries

- Timeline is append-only. Corrections are represented as new events, never mutation of historical facts.
- LCM is a materialized current-state model. It is not an independent source of history.
- CRE produces explainable reasoning results, not direct hardware commands.
- CAE owns action state transitions and dispatch decisions; plugins own execution mechanics.
- Plugins must not import UI code, LCM logic, CRE rules, or browser state.
- Devices submit observations through approved ingestion contracts. Devices do not write LCM, CRE, or CAE tables directly.
- Realtime is a delivery channel, not the source of truth.
- RLS is a mandatory tenant isolation boundary, not a UI convention.

## 4. Organization And Ownership

Every production artifact has a primary owner. A primary owner is accountable for reliability, documentation, tests, operational readiness, and approved changes. Secondary reviewers protect cross-domain boundaries.

| Team | Primary ownership |
|---|---|
| Companion Experience | Guardian-facing web experience, shared presentation components, accessibility |
| Timeline And Event Platform | Event contracts, event ingestion, Timeline querying and retention |
| Companion Intelligence | LCM, CRE, evidence contracts, explainability |
| Action And Automation Platform | CAE lifecycle, approvals, idempotency, execution outcomes |
| Devices And Integrations | Device enrollment, plugins, ONVIF and supported integrations |
| Edge Runtime | Android, embedded, BLE, local persistence, connectivity recovery |
| Cloud Platform | Supabase, PostgreSQL, RLS, identity, storage, database migrations |
| Reliability And Infrastructure | CI/CD, environments, SLOs, alerting, recovery, deployment |
| Security And Privacy | Threat modeling, security review, privacy controls, incident support |
| Developer Experience And Quality | Tooling, tests, local development, code generation, engineering standards |
| Data And Health Foundations | Health/telemetry semantics, validation, retention, data quality |

### 4.1 Ownership Rules

- Every table has one owning team.
- Every API has one owning team.
- Every plugin has one owning team and a supported-device matrix entry.
- Every alert has an owning on-call rotation.
- Every shared package has an owner, compatibility policy, and release process.
- Cross-team changes require the owners of all affected boundaries as reviewers.

## 5. Repository And Folder Organization

The primary repository is a monorepo until deploy cadence, language/toolchain, or security boundaries require separation.

```text
apps/
  web/                       Next.js guardian experience and authenticated APIs
packages/                    Shared contracts and reusable implementation packages
supabase/
  migrations/                Ordered database migrations
  seed/                      Deterministic local and test fixtures
docs/                        Specifications, runbooks, ADRs, RFCs, handbook
infra/                       Infrastructure as code when introduced
.github/                     CI, CODEOWNERS, repository policies
```

### 5.1 Web Application Layout

```text
apps/web/src/
  app/                       Route composition only
  features/<domain>/         Feature UI, feature loaders, client hooks
  shared/                    Domain-neutral presentation and browser utilities
  lib/
    services/                Domain orchestration and pure policies
    plugins/                 Device/external-system interfaces and adapters
    supabase/                Supabase infrastructure adapters only
  server/
    actions/                 Validated server action entry points
```

### 5.2 Folder Rules

- `app/` composes routes, boundaries, metadata, and route-specific loading/error behavior.
- `features/` owns a user-visible domain and its view models. It may not contain generic infrastructure.
- `shared/components/` is domain-neutral. It may not query Supabase or import domain services.
- `lib/services/` contains domain orchestration and policies. It may not import React, browser APIs, or route modules.
- `lib/plugins/` contains integration boundaries. It may not import dashboard, LCM, CRE, or client-store code.
- `lib/supabase/` contains only Supabase client/configuration/infrastructure concerns.
- `server/actions/` validates and coordinates commands. It does not contain hidden UI logic.
- `supabase/migrations/` contains database changes only. Historical deployed migrations are never edited.

### 5.3 Allowed Dependencies

```text
Route / API / Server Action
  -> Feature Loader or Command Handler
  -> Domain Service or Policy
  -> Repository / Gateway Interface
  -> Supabase, PostgreSQL, External Service, Device Protocol
```

```text
React Feature Component
  -> Feature View Model / Client Hook
  -> Typed Server Action or Typed API Client
```

### 5.4 Forbidden Dependencies

- Shared UI components importing Supabase clients.
- React components using raw persistence rows as display models.
- Domain services importing React, `window`, browser storage, or route modules.
- CRE or LCM importing concrete plugins.
- Plugins importing UI components or client stores.
- Device firmware importing cloud database implementation details.
- Browser code importing service-role helpers or private environment variables.
- Database migrations depending on application code.
- Lower layers importing higher layers.

## 6. Coding Standards

### 6.1 General

- Favor small cohesive modules over large utility collections.
- Prefer explicit data transformations over chained assertions.
- Keep side effects at boundaries.
- Use pure functions for domain reductions, mappings, and validation where possible.
- Do not introduce a new abstraction until there are at least two concrete consumers or one clear boundary requirement.
- Do not add compatibility paths without a real persisted-data, deployed-client, or external-consumer need.
- Remove dead code, stale imports, and unused parameters in the same pull request that reveals them.
- Comments explain non-obvious reasoning, invariant, constraint, or tradeoff. They do not narrate syntax.

### 6.2 Error Handling

- Never ignore a failed write.
- Never report success after a dependent operation fails.
- Never translate an infrastructure failure into an empty data set without an explicit unavailable state.
- Use typed application errors with stable codes at service/API boundaries.
- User-facing messages must be safe and actionable; internal error detail belongs in structured logs.
- External effects distinguish `completed`, `failed`, `rejected`, `timed_out`, and `unknown` where applicable.

### 6.3 Logging

- Use structured logs in server and edge code.
- Include relevant identifiers: request ID, correlation ID, organization ID, pet ID, device ID, event ID, action ID, operation, duration, and outcome.
- Do not log secrets, credentials, raw tokens, full media URLs, full chat prompts, sensitive health payloads, or personally identifying data unless explicitly approved and redacted.
- Log errors once at the handling boundary. Do not repeatedly log and rethrow the same exception at every layer.
- `console.error` is limited to local development tooling; production code uses the approved logger.

## 7. TypeScript Standards

### 7.1 Type Safety

- TypeScript strict mode is mandatory.
- `any` is prohibited except in approved third-party boundary shims with an explanatory comment.
- `unknown` is accepted only at untrusted boundaries and must be narrowed by validation before use.
- Do not use `as unknown as T` to bridge schema or API mismatches.
- Do not cast unrelated concepts, such as action priority to event severity. Use explicit exhaustive mapping functions.
- Prefer discriminated unions for command results, external outcomes, and state transitions.
- Prefer branded/validated IDs at domain boundaries when type confusion is material.

### 7.2 Contracts

- Persistence types represent storage, not presentation.
- API input/output types are defined from validation schemas or explicit contracts.
- Feature view models are shaped by feature loaders before React rendering.
- JSONB payloads require Zod schemas at ingress and inferred TypeScript types for use.
- Generated Supabase types are authoritative for table shape and must be refreshed after schema changes.

### 7.3 Naming

- Use verbs for commands: `createEvent`, `approveAction`, `recordExecution`.
- Use nouns for queries: `getTimeline`, `getCurrentState`, `listDevices`.
- Use `pet` for persisted entity terminology and `companion` for guardian-facing presentation terminology.
- Use approved platform abbreviations only: LCM, CRE, CAE, RLS, API, BLE, ONVIF.
- Avoid vague names such as `data`, `manager`, `helper`, `utils`, and `handler` unless bounded by a clear module context.

## 8. React And Accessibility Standards

### 8.1 Component Design

- Default to Server Components. Use Client Components only for interaction, browser APIs, local state, streaming, or Realtime reconciliation.
- Route files load and compose; they do not become large presentation modules.
- Presentational components receive view models, never raw Supabase rows or JSONB blobs.
- Feature state has one owner: server snapshot with refresh, optimistic client state with rollback, or documented client cache.
- Do not copy server props into state without a synchronization rule.
- Client hooks are feature-specific when they encode domain behavior. Shared hooks remain domain-neutral.
- Avoid `useMemo` and `useCallback` unless performance evidence or dependency stability requires them.

### 8.2 App Router

- Every significant route group provides `loading.tsx`, `error.tsx`, and appropriate `not-found.tsx` behavior.
- Use `notFound()` for missing or unauthorized entity routes after authorized lookup.
- Keep authenticated route protection at middleware plus explicit API/server-action checks.
- Server actions validate input and return a consistent result union.
- Do not use `window.location.reload()` for normal data synchronization; use router refresh/navigation after successful command completion.

### 8.3 Accessibility

- Do not disable browser zoom or user scaling.
- All dialogs use the approved accessible dialog primitive with focus trap, Escape close, focus restoration, labels, and keyboard behavior.
- Do not nest buttons inside links or links inside buttons.
- Every form control has a unique ID and associated label.
- Icon-only buttons require an accessible name.
- Tabs use semantic tab roles, selected state, keyboard navigation, and associated panels.
- Empty, loading, error, and unavailable states must be announced and understandable.
- Core workflows are tested by keyboard and screen reader before release.

### 8.4 Frontend Performance Budgets

| Budget | Target |
|---|---:|
| Initial JavaScript for primary dashboard route | Reviewed on every major dependency addition |
| Largest Contentful Paint on supported mobile connection | <= 2.5 seconds target |
| Interaction to Next Paint | <= 200 ms target |
| Cumulative Layout Shift | <= 0.1 target |
| Client-side fatal error rate | < 0.1% sessions |
| Realtime subscriptions per page | Minimum necessary, scoped by tenant/domain |
| Dashboard route query count | Explicitly reviewed; batch through loaders where possible |

Performance regressions outside a budget require an ADR, owner, mitigation date, and measurement plan.

## 9. Next.js And API Standards

### 9.1 Route Handlers

Every route handler follows this order:

1. Establish request ID/correlation context.
2. Parse bounded request body safely.
3. Authenticate caller.
4. Authorize tenant, user role, or device capability.
5. Validate input with a schema.
6. Invoke a command or query boundary.
7. Map typed errors to stable HTTP responses.
8. Emit safe structured telemetry.
9. Return a typed response.

### 9.2 API Requirements

- All mutation APIs document idempotency behavior.
- Query parameters are schema-validated, bounded, and normalized.
- Request bodies have size and batch limits.
- APIs do not rely solely on middleware for authorization.
- Device APIs use device identity, not guardian browser session identity.
- External redirects are internal-path allowlisted and normalized.
- Public responses never expose database internals, secrets, or unredacted provider errors.
- APIs serving Timeline/history use stable cursor pagination when data volume requires it.

### 9.3 Server Actions

- Server actions are command entry points, not repositories.
- Validate `FormData` or serialized inputs at entry.
- Return one shared result shape:

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };
```

- Check every dependent write.
- Revalidate only affected routes.
- Do not embed business rules that belong in domain services.

## 10. Supabase And Database Standards

### 10.1 Supabase Client Use

- Cookie-backed clients are constructed at web request boundaries only.
- Domain services receive repositories/adapters; they do not construct request-bound Supabase clients directly.
- Service-role access is exceptional, server-only, audited, and contained in a restricted infrastructure module.
- Browser code uses only the public client and approved feature subscriptions.
- Every client use preserves tenant and authorization semantics.

### 10.2 Repository Standards

- Repositories are feature-owned, small, and explicit.
- Repositories own PostgREST query syntax, joins, error translation, and persistence mapping.
- Repositories return domain objects or feature view models, not raw query shape by default.
- Do not create a generic `BaseRepository<T>`.
- Multi-write workflows use transaction-owning database RPCs or equivalent explicit transaction boundaries.

### 10.3 Row Level Security

- RLS is enabled on every tenant-owned table.
- Policies enforce tenant isolation and role authorization independently of UI behavior.
- Policy names state the actual behavior they enforce.
- Every policy change has multi-tenant integration tests for read, insert, update, delete, and role boundaries as applicable.
- Security-definer functions use explicit schema qualification and a hardened `search_path`.
- Authorization helpers have one owner: Cloud Platform, reviewed by Security And Privacy.

### 10.4 Database Constraints

- Use database constraints for invariants that must hold under every caller.
- Tenant-bearing references must be validated for organization consistency.
- Numeric health, confidence, duration, and score fields have justified ranges and units.
- Enumerated lifecycle states use constrained values and explicit state-transition logic.
- Foreign-key columns used by query paths are indexed deliberately.
- Do not rely on UI validation for integrity.

### 10.5 Realtime

- Realtime channels are scoped by tenant and domain where supported.
- Realtime payloads update typed view models; raw rows do not overwrite richer joined models blindly.
- Realtime subscriptions handle reconnect, insert, update, and delete behavior relevant to their feature.
- Realtime does not replace durable event ingestion, command execution, or recovery mechanisms.

## 11. Migration Standards

- Migrations are append-only after deployment. Never edit historical production migrations.
- One migration has one coherent purpose.
- Migration filenames are ordered and descriptive.
- Every migration documents owner, purpose, dependency, data impact, locking risk, and rollback/mitigation.
- Migrations must apply to a clean database and staging copy before production.
- Generated database types are refreshed after schema changes.
- RLS changes include authorization tests.
- Index changes include representative query-plan review.
- Data backfills are separate from schema changes where practical.
- Destructive changes require a staged compatibility plan and architecture review.

## 12. Timeline Standards

- Timeline is the immutable event history for observations and action feedback.
- PostgreSQL always-enabled triggers reject `UPDATE`, `DELETE`, and `TRUNCATE` against `public.pet_events`; application code must not provide mutation APIs for Timeline history.
- A Timeline event contains an authoritative source, category/type, event time, ingestion time, tenant context, and immutable `event_id`, `correlation_id`, `causation_id`, `trace_id`, `request_id`, and `actor_id` context.
- Event identity is stable across retries and edge synchronization.
- Event creation is idempotent for device-originated and retryable ingestion paths.
- Event ordering uses documented source-time and ingestion-time semantics; do not assume database insertion time equals observation time.
- Event metadata is schema-validated, size-bounded, and privacy-reviewed.
- Timeline corrections are additive events linked by causation/relationship, not updates to prior events.
- Queries use explicit filters, stable sorting, and cursor pagination where applicable.
- Timeline retention and archival follow the approved privacy and operations policy.

## 13. LCM Standards

- LCM is current derived state, not historical truth.
- LCM updates are deterministic from authorized events and defined state rules.
- State updates use versioning or concurrency control; blind last-writer-wins updates are prohibited.
- Compare-and-swap updates retry at most three times, then fail with an explicit concurrency conflict.
- Duplicate and out-of-order Timeline events return the current LCM state without advancing its version.
- Older events must not silently regress newer state.
- Initialization is explicit and idempotent.
- LCM read operations are side-effect free. Initialization and recomputation are commands.
- State changes include source event and generated-time provenance.
- Scores, confidence, and summaries must state their semantic source and be bounded/validated.
- LCM behavior requires replay and concurrency tests.

## 14. CRE Standards

- CRE is deterministic and explainable.
- Every reasoning result has input state/version, rule version, evidence references, confidence semantics, status, and expiry/supersession behavior.
- Evidence must reference persisted Timeline, telemetry, LCM, or other approved source records.
- CRE must not fabricate observations, health measurements, or device behavior.
- Reasoning is deduplicated for unchanged inputs.
- Query methods do not cause new reasoning writes; evaluation is an explicit command/workflow.
- Priority ordering is explicit and never inferred from lexical text ordering.
- CRE does not execute devices or import concrete plugins.
- Rule changes require Companion Intelligence review and regression tests.

## 15. CAE Standards

- CAE owns the action lifecycle from request through terminal outcome.
- Every action has tenant context, causation/correlation, idempotency key, lifecycle status, and audit actor where applicable.
- State transitions are atomic and conditional.
- Only one executor may claim a logical action attempt.
- Approval transitions verify authorization and expected current state.
- Actions transition only through `pending -> approved -> executing -> completed|failed`, with cancellation permitted before execution. Repeated requests return the existing idempotent action rather than creating or executing another action.
- Timeline feedback reflects actual outcome, never presumed success.
- Retry behavior is explicit, bounded, and safe for the action class.
- CAE rejects unsupported actions and invalid target capabilities.
- CAE owns action conflict, cooldown, and duplicate prevention policy.

## 16. Plugin Standards

- Plugins isolate hardware and third-party protocol behavior from CAE.
- Plugins expose only necessary contracts: capability discovery, health status, and execution behavior may be separated when consumers differ.
- Plugins receive validated action commands and target context; they do not decide reasoning or approval policy.
- Every plugin execution has a timeout, cancellation behavior, correlation ID, and classified outcome.
- A plugin may not report success without a defined acknowledgement standard.
- Mock plugins are restricted to test/development composition. Production composition must use real adapters or fail explicitly.
- Unsupported action/capability combinations fail closed.
- Every plugin has contract tests and supported-device integration tests.
- Plugin version compatibility is documented.

## 17. Edge Runtime Standards

- Edge runtime authenticates as a device, not as a guardian browser user.
- Device credentials are securely stored, rotatable, revocable, and never logged.
- Edge local storage is append-only for unacknowledged observations.
- Edge synchronization sends Timeline events, not cloud-derived LCM/CRE/CAE state.
- Every synced event has idempotency identity, source timestamp, and source sequence where supported.
- Reconnect, restart, duplicate delivery, clock skew, and out-of-order delivery are tested.
- BLE is treated as local transport through an approved gateway; BLE peripherals do not gain direct cloud database authority.
- OTA behavior requires compatibility, rollback, integrity, and fleet observability controls.
- Hardware-in-the-loop tests are required before supported-device release.

## 18. Security And Privacy Standards

### 18.1 Security

- Apply least privilege to users, services, devices, and CI identities.
- Authentication and authorization are separate checks.
- Use device-specific identity for device APIs.
- Treat service role credentials as production break-glass capability.
- Validate all untrusted inputs before persistence or external calls.
- Review all external redirects, webhooks, uploads, and media URLs.
- Scan dependencies, secrets, and infrastructure configurations continuously.
- Security exceptions require owner, expiration date, mitigation, and Security approval.
- Critical vulnerabilities are triaged immediately and remediated under the incident process.

### 18.2 Privacy

- Classify guardian identity, household location, companion health, media, telemetry, and conversation data as sensitive.
- Collect only data required for approved functionality.
- Storage paths and media access are tenant-scoped and authorized.
- Use short-lived signed media access where applicable.
- Retention, export, deletion, and legal hold processes are documented and owned.
- Do not include sensitive content in logs, metrics, error messages, analytics, or test fixtures.
- Production data is never copied into local development environments without approved anonymization.

## 19. Observability And Monitoring Standards

### 19.1 Required Telemetry

Every production service exposes or records:

- Request rate, success rate, failure rate, and latency.
- Authorization failures and validation failures.
- Database query errors and meaningful latency.
- Event ingestion success, duplicate handling, and lag.
- LCM materialization lag and concurrency conflicts.
- CRE evaluation duration, deduplication, and evidence availability.
- Action lifecycle counts, execution latency, timeout rate, retry rate, and unknown outcomes.
- Plugin health, dispatch success, error class, and command latency.
- Device heartbeat, connectivity, credential failures, and firmware compatibility.
- Realtime connection, delivery, reconnect, and subscription error behavior.

### 19.2 Monitoring Rules

- Every alert has a severity, owner, runbook, and expected response time.
- Alerts are actionable; avoid alerts that merely restate normal load.
- Dashboards show service health, tenant impact, action safety, device fleet health, and database health.
- Release markers are emitted for deployments and migrations.
- Logs, traces, and metrics use shared correlation identifiers.
- Sensitive dimensions are redacted or excluded from telemetry.

### 19.3 Operational Budgets

| Measure | Standard |
|---|---|
| Critical action duplicate execution | 0 tolerated |
| Unauthorized cross-tenant access | 0 tolerated |
| Timeline mutation | 0 tolerated |
| Unhandled production exception | Investigated within business day; critical paths immediately |
| Change failure rate | Reviewed weekly by Reliability And Infrastructure |
| Mean time to detect critical incident | Measured and improved quarterly |
| Mean time to recover critical incident | Measured and improved quarterly |
| CI main-branch failure | Treated as an ownership issue immediately |
| Flaky test rate | Tracked; quarantined tests must have an owner and expiry |

## 20. Testing Standards

### 20.1 Test Pyramid

| Test type | Purpose |
|---|---|
| Unit tests | Pure reducers, mappings, policies, validation, lifecycle decisions |
| Component tests | Rendering, accessibility, interaction, error/empty/loading states |
| Route/API tests | Authentication, validation, response contracts, error mapping |
| Database/RLS integration tests | Tenant isolation, roles, policies, constraints, migrations |
| Service integration tests | Repository interaction, transactional workflows, idempotency |
| Plugin contract tests | Capability, timeout, outcome, retry, error mapping |
| Hardware-in-the-loop tests | Actual device/protocol behavior before supported release |
| Load/failure tests | Capacity, concurrency, reconnect, retries, recovery |

### 20.2 Required Coverage

- Tests are risk-based, not percentage-based.
- Every bug with recurrence risk receives a regression test, alert, or runbook update.
- Every new mutation tests authorization, validation, happy path, expected failure, and tenant boundary.
- Every RLS policy change tests at least two organizations and relevant roles.
- Every LCM/CRE/CAE change tests deterministic behavior and failure paths.
- Every plugin change tests timeout, rejection, retry classification, and target compatibility.
- Every accessibility-sensitive UI change includes keyboard and semantic coverage.

### 20.3 Test Data

- Fixtures are deterministic and visibly marked as fixtures.
- Development fixtures are not silently rendered as live production state.
- Test data contains no production secrets or personal data.
- Local Supabase setup and seeds are reproducible from a clean checkout.

## 21. CI/CD Standards

### 21.1 Pull Request Pipeline

Every pull request runs:

1. Lockfile-based install.
2. Formatting check.
3. Lint.
4. Typecheck.
5. Unit and component tests.
6. API route tests.
7. Database migration apply/reset validation.
8. RLS integration tests for affected policy areas.
9. Generated type drift check.
10. Dependency, license, secret, and static security scans.
11. Production build.
12. Deploy preview and smoke test for applicable web changes.

### 21.2 Main Branch Pipeline

- Repeats required pull request checks.
- Deploys to staging before production.
- Applies migrations through controlled deployment automation.
- Runs staging smoke tests and selected integration tests.
- Emits deployment and migration release markers.
- Uses progressive rollout where supported.
- Verifies health checks before completion.
- Supports documented rollback or mitigation.

### 21.3 CI Rules

- Lint, typecheck, and tests are independent of build unless a dependency is technically necessary.
- Main branch must remain green.
- Failing/flaky CI has an owner and priority.
- No manual production database change bypasses migration history except approved emergency procedure.

## 22. Branch And Release Strategy

### 22.1 Branch Strategy

Project One uses trunk-based development.

- `main` is always releasable.
- Branches are short-lived, normally under two working days.
- Feature flags, not long-lived branches, control incomplete behavior.
- Release artifacts are tagged.
- Hotfixes may branch from a release tag only when compatibility requires it, then merge back to `main` immediately.

### 22.2 Release Stages

| Stage | Rules |
|---|---|
| Alpha | Controlled homes/devices, strict allowlists, staging verification, manual approval for high-risk changes |
| Beta | Larger cohort, weekly release train, automated regression and compatibility coverage |
| GA | Formal SLOs, capacity targets, incident/on-call maturity, deprecation policy |
| Hotfix | Minimal diff, incident reference, expedited review, post-deploy verification |
| Emergency patch | Incident commander authority, immediate mitigation, mandatory follow-up review within 72 hours |

## 23. Definition Of Ready

Work is ready to start when:

- It has a clear owner and approved scope.
- It identifies affected domains, APIs, tables, device contracts, and UI surfaces.
- Acceptance criteria are testable.
- Security/privacy implications are identified.
- Migration, compatibility, and rollback needs are understood.
- Dependencies are known and available.
- Observability expectations are stated for production-impacting behavior.
- The work does not reopen frozen architecture or approved backlog without governance approval.

## 24. Definition Of Done

### 24.1 Pull Request

A pull request is complete when:

- It is cohesive, reviewable, and linked to approved work.
- Required owners approve it.
- CI passes.
- Relevant tests are added or updated.
- New behavior is observable and documented where appropriate.
- Security and privacy reviews are complete where required.
- No unchecked write, silent catch, unsafe type escape, or dead code is introduced.
- Rollback/mitigation is documented for persistent-data, device, or production-impacting change.

### 24.2 Feature Or Capability

A capability is complete when:

- It has a named owner, operational dashboard, and runbook if production-impacting.
- It handles loading, empty, unavailable, and error states.
- It is accessible and tested.
- It is tenant-safe and role-safe.
- It has validated API/command boundaries.
- It does not display fixtures as live operational truth.
- Documentation, support expectations, and monitoring are complete.

### 24.3 Migration

A migration is complete when:

- It passes clean reset, staging apply, generated type validation, and affected RLS tests.
- It has Cloud Platform owner approval.
- It has query/index/locking review.
- It has a rollback or mitigation plan.

### 24.4 Plugin Or Device Integration

A plugin/device integration is complete when:

- It has explicit capabilities, identity, timeout, health, and error behavior.
- Unsupported operations fail closed.
- Contract and hardware/protocol tests pass.
- Credential lifecycle and compatibility are documented.
- Operational ownership and runbooks are assigned.

## 25. Code Review Checklist

Reviewers verify:

- Does the change respect domain and dependency boundaries?
- Is ownership correct and are required reviewers included?
- Is the code readable without hidden assumptions?
- Are side effects explicit and at the correct boundary?
- Are types preserving rather than bypassing domain meaning?
- Are input validation, authentication, authorization, and tenant checks complete?
- Are database constraints/RLS/migration effects considered?
- Are all writes checked and failures surfaced correctly?
- Is error handling explicit and safe?
- Are logs/metrics/traces sufficient for production diagnosis?
- Are tests proportionate to risk and covering regressions?
- Is UI accessible, responsive, and free of nested interactive controls?
- Does the change introduce demo/mock state into production behavior?
- Is rollback or mitigation clear?
- Is documentation updated?

## 26. Pull Request Checklist

Authors include:

- [ ] Linked approved issue/work item.
- [ ] Problem and intended behavior.
- [ ] Affected domain owners.
- [ ] Database/API/device impact.
- [ ] Security/privacy impact.
- [ ] Test evidence.
- [ ] Screenshots or recordings for UI changes.
- [ ] Migration validation evidence, if applicable.
- [ ] RLS test evidence, if applicable.
- [ ] Observability changes, if applicable.
- [ ] Rollback/mitigation statement.
- [ ] Documentation updates.
- [ ] Confirmation that no feature scope or architecture was changed without ADR/RFC.

## 27. Production Readiness Checklist

Before production promotion, confirm:

- [ ] All required CI checks are green.
- [ ] Staging deployment succeeded.
- [ ] Migration was validated and backed up where necessary.
- [ ] RLS/tenant isolation behavior was verified.
- [ ] Feature flags/defaults are correct.
- [ ] Alerts, dashboards, logs, and traces are available.
- [ ] On-call owner and runbook are assigned.
- [ ] Rollback/mitigation path was reviewed.
- [ ] Capacity and rate-limit impact are understood.
- [ ] Secrets and configuration are present and validated.
- [ ] Device/plugin compatibility was verified for affected integrations.
- [ ] User-visible errors and unavailable states are acceptable.
- [ ] Privacy retention/media implications were reviewed.

## 28. Incident Response

### 28.1 Severity

| Severity | Definition | Response |
|---|---|---|
| SEV-1 | Active safety risk, widespread outage, tenant breach, critical data integrity threat | Immediate incident commander, continuous response, executive notification |
| SEV-2 | Major functionality degraded, material cohort impact, unsafe action path contained | Immediate on-call response, named incident lead |
| SEV-3 | Limited feature degradation, workaround available | Business-hours response or on-call judgement |
| SEV-4 | Minor defect, low operational impact | Normal prioritized workflow |

### 28.2 Incident Rules

- Stabilize safety and customer impact before root-cause analysis.
- The incident commander may disable integrations, feature flags, action classes, or deployments.
- Preserve evidence: correlation IDs, affected tenants, events, actions, logs, deployments, and configuration changes.
- Communicate facts, impact, mitigation, and next update time. Do not speculate.
- Every SEV-1/SEV-2 incident receives a blameless retrospective.
- Retrospectives produce owned corrective actions with due dates.

## 29. Runbook Minimums

Every owned production subsystem has runbooks for:

- Service unavailable or elevated error rate.
- Database migration failure.
- RLS authorization incident.
- Suspected cross-tenant access.
- Compromised user, device, or service credential.
- Device fleet connectivity degradation.
- Plugin timeout/failure surge.
- Duplicate or unknown action outcome.
- Timeline ingestion backlog/failure.
- LCM materialization lag or stale state.
- CRE evidence or reasoning anomaly.
- Realtime delivery outage.
- Media access/privacy incident.
- Rollback and feature disablement.
- Backup restore and disaster recovery.

Every runbook includes owner, severity guidance, prerequisites, diagnosis steps, safe mitigation, escalation contacts, validation steps, and follow-up requirements.

## 30. ADR And RFC Process

### 30.1 ADR

An ADR is required for long-lived, reversible-with-difficulty decisions, including:

- New shared package or external dependency with operational/security impact.
- New table or changed ownership of a major table.
- New authentication/authorization mechanism.
- Changed Timeline, LCM, CRE, CAE, RLS, or plugin contract semantics.
- New device protocol version or new deployment runtime.
- Material data retention, encryption, or media access policy change.

ADR format:

1. Context.
2. Decision.
3. Constraints and alternatives considered.
4. Consequences.
5. Ownership.
6. Compatibility and rollback.
7. Links to implementation and tests.

### 30.2 RFC

An RFC is required for cross-team or externally visible changes, including:

- Public API/device protocol changes.
- Cross-domain changes affecting two or more teams.
- Large-scale performance or reliability changes.
- Platform-wide CI/CD, observability, retention, or infrastructure changes.
- Any exception to frozen architecture or handbook dependency rules.

RFCs are time-boxed. The Architecture Council approves direction; implementation teams own delivery.

## 31. Architecture Governance

The Architecture Council consists of VP Engineering, Principal Engineers for Cloud Platform, Companion Intelligence, Devices/Edge Runtime, Security lead, Reliability lead, and the relevant domain technical lead.

The council governs:

- Frozen architecture boundaries.
- Cross-team dependencies.
- Long-lived platform commitments.
- Data, tenant, device, and security boundaries.
- Exceptions to standards.

The council does not approve routine implementation details, ordinary pull requests, or feature-local refactors.

## 32. Documentation Standards

- Documentation is code-adjacent, versioned, reviewed, and owned.
- Every subsystem page lists owner, purpose, dependencies, APIs/contracts, data stores, operational dashboards, SLOs, and runbooks.
- Every public or device-facing contract includes versioning and compatibility rules.
- Every table has documented owner, purpose, retention, and RLS access model.
- Every operational alert links to a runbook.
- Every ADR/RFC is indexed and discoverable.
- Documentation changes are required when behavior, ownership, configuration, compatibility, or operations change.

## 33. Developer Onboarding

### Day 1

- Provision least-privilege access.
- Complete local setup from clean checkout.
- Run local web, Supabase, lint, typecheck, tests, and build.
- Read the domain glossary and this handbook's principles, security, and dependency rules.
- Meet assigned engineering buddy and team technical lead.
- Submit a small documentation or low-risk code change.

### Week 1

- Complete secure coding and privacy training.
- Trace one event from ingestion through Timeline, LCM, CRE, CAE, plugin, and feedback.
- Run multi-tenant RLS tests locally.
- Shadow a code review and staging deployment.
- Complete one scoped change with tests and ownership review.

### Month 1

- Own one bounded subsystem or feature slice.
- Shadow on-call.
- Update one runbook.
- Complete one supervised API, migration, or device-contract change.
- Present one engineering learning or improvement to the team.

## 34. Technical Leadership Expectations

### Technical Leads

- Maintain team boundaries and quality bars.
- Keep ownership, runbooks, dashboards, and architectural context current.
- Make decisions visible and reversible where possible.
- Review for correctness, operability, security, and maintainability, not merely style.
- Reduce complexity rather than accumulate framework layers.
- Mentor engineers in testing, design, incident response, and code review.
- Escalate architecture boundary concerns early.

### Staff Engineers

- Solve cross-team problems through alignment and durable technical mechanisms.
- Improve shared standards, interfaces, developer experience, and reliability.
- Make adjacent teams more effective without becoming a bottleneck.
- Write ADRs/RFCs for material cross-domain changes.
- Lead difficult incident analysis and long-term remediation.

### Principal And Distinguished Engineers

- Protect system coherence across organization boundaries.
- Set multi-year technical direction within approved architecture.
- Resolve systemic quality, scaling, security, and reliability risks.
- Build technical leadership capacity across teams.
- Ensure architectural decisions have measurable operational outcomes.

## 35. Engineering Career Ladder

| Level | Core expectation |
|---|---|
| Engineer I | Delivers scoped work with guidance, follows standards, writes tests |
| Engineer II | Independently owns features and operational quality within a team boundary |
| Senior Engineer | Leads complex team projects, mentors, improves local systems and practices |
| Staff Engineer | Leads cross-team technical initiatives and creates durable leverage |
| Principal Engineer | Owns organization-wide technical direction and critical platform coherence |
| Distinguished Engineer | Shapes multi-year system quality, reliability, and engineering capability across the company |

Promotion is based on sustained scope, technical judgment, ownership, mentorship, operational excellence, and leverage. It is not based on lines of code, title tenure, or individual heroics.

## 36. Quality Metrics

Engineering leadership reviews these monthly:

| Area | Measures |
|---|---|
| Delivery | Lead time, deployment frequency, review time, change failure rate |
| Quality | Escaped defects, regression rate, test reliability, static-analysis health |
| Reliability | Availability, error-budget burn, MTTR, MTTD, incident recurrence |
| Security | Open vulnerability age, secret incidents, authorization defects, remediation time |
| Data integrity | Duplicate action rate, Timeline mutation attempts, LCM conflict rate, event rejection quality |
| Devices | Activation rate, online rate, command success, firmware compatibility, reconnect delivery |
| Developer experience | CI duration, flaky-test rate, local setup success, developer satisfaction |
| Accessibility | Core-flow audit status, keyboard defects, assistive-technology regressions |
| Performance | Core Web Vitals, API p95/p99, database query latency, Realtime health |

Metrics identify systems to improve. They are not individual performance scorecards.

## 37. Operational Excellence

Operational excellence means:

- Production behavior is measurable.
- Ownership is known.
- Failures are contained and recoverable.
- Releases are repeatable.
- Rollbacks and mitigations are practiced.
- Security boundaries are tested.
- Data integrity is enforced by systems, not hope.
- Device behavior is verified against real hardware.
- Incidents improve the system rather than assign blame.

No capability is considered mature because it works in a demo. It is mature when it is safe to change, observable when failing, recoverable under stress, understandable to a new engineer, and owned by a team prepared to operate it.
