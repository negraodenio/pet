import { randomUUID } from "node:crypto";

export const EVENT_ACTORS = [
  "guardian",
  "system",
  "automation",
  "device",
  "veterinarian",
  "administrator",
] as const;

export type EventActor = (typeof EVENT_ACTORS)[number];

/** Immutable identity persisted with a Timeline event. */
export interface EventIdentity {
  event_id: string;
  correlation_id: string;
  causation_id: string | null;
  trace_id: string;
  request_id: string;
  actor_id: EventActor;
}

/** Event fields that describe provenance in addition to its identity. */
export interface EventMetadata extends EventIdentity {
  source: string;
  created_by: string | null;
  created_at: string;
}

/** Identity propagated through one request and its derived cognitive work. */
export interface EventContext {
  correlation_id: string;
  causation_id: string | null;
  trace_id: string;
  request_id: string;
  actor_id: EventActor;
}

export function createEventContext(
  overrides: Partial<EventContext> = {},
): EventContext {
  return {
    correlation_id: overrides.correlation_id ?? randomUUID(),
    causation_id: overrides.causation_id ?? null,
    trace_id: overrides.trace_id ?? randomUUID(),
    request_id: overrides.request_id ?? randomUUID(),
    actor_id: overrides.actor_id ?? "system",
  };
}

export function contextFromEvent(
  event: Pick<
    EventIdentity,
    "correlation_id" | "causation_id" | "trace_id" | "request_id" | "actor_id"
  >,
): EventContext {
  return {
    correlation_id: event.correlation_id,
    causation_id: event.causation_id,
    trace_id: event.trace_id,
    request_id: event.request_id,
    actor_id: event.actor_id,
  };
}

export function createDerivedEventContext(
  parent: Pick<EventIdentity, "event_id" | "correlation_id" | "trace_id" | "request_id">,
  actor_id: EventActor,
): EventContext {
  return {
    correlation_id: parent.correlation_id,
    causation_id: parent.event_id,
    trace_id: parent.trace_id,
    request_id: parent.request_id,
    actor_id,
  };
}
