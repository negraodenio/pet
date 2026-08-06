import { createHash, randomUUID } from "node:crypto";

export declare const actionIdBrand: unique symbol;
export declare const idempotencyKeyBrand: unique symbol;
export declare const claimTokenBrand: unique symbol;

export type ActionId = string & {
  readonly [actionIdBrand]: "ActionId";
};

export type IdempotencyKey = string & {
  readonly [idempotencyKeyBrand]: "IdempotencyKey";
};

export type ClaimToken = string & {
  readonly [claimTokenBrand]: "ClaimToken";
};

export type ActionState =
  | "pending"
  | "approved"
  | "executing"
  | "completed"
  | "failed"
  | "cancelled";

export interface ActionExecutionContext {
  readonly action_id: ActionId;
  readonly idempotency_key: IdempotencyKey;
  readonly execution_hash: string;
  readonly correlation_id: string;
  readonly causation_id: string | null;
  readonly trace_id: string;
  readonly request_id: string;
  readonly actor_id: string;
}

export interface ExecutionResult {
  readonly success: boolean;
  readonly executionTimeMs: number;
  readonly errorMessage?: string;
}

export class DuplicateActionError extends Error {
  constructor(readonly idempotencyKey: IdempotencyKey) {
    super(`Action with idempotency key ${idempotencyKey} already exists.`);
    this.name = "DuplicateActionError";
  }
}

export class IllegalStateTransitionError extends Error {
  constructor(readonly actionId: string, readonly from: string, readonly to: string) {
    super(`Illegal action transition for ${actionId}: ${from} -> ${to}.`);
    this.name = "IllegalStateTransitionError";
  }
}

export class IdempotencyViolationError extends Error {
  constructor(readonly idempotencyKey: IdempotencyKey) {
    super(`Idempotency key ${idempotencyKey} was reused for a different action.`);
    this.name = "IdempotencyViolationError";
  }
}

export class OwnershipViolationError extends Error {
  constructor(readonly actionId: string) {
    super(`Claim token does not own action ${actionId}.`);
    this.name = "OwnershipViolationError";
  }
}

export class ClaimConflictError extends Error {
  constructor(readonly actionId: string) {
    super(`Action ${actionId} is already claimed by another worker.`);
    this.name = "ClaimConflictError";
  }
}

export class LeaseExpiredError extends Error {
  constructor(readonly actionId: string) {
    super(`Execution lease for action ${actionId} has expired.`);
    this.name = "LeaseExpiredError";
  }
}

export function createIdempotencyKey(): IdempotencyKey {
  return `action:${randomUUID()}` as IdempotencyKey;
}

export function createClaimToken(): ClaimToken {
  return randomUUID() as ClaimToken;
}

export function createExecutionWorker(): string {
  return `worker:${randomUUID()}`;
}

export function toIdempotencyKey(value: string): IdempotencyKey {
  if (!value.trim() || value.length > 200) {
    throw new Error("Idempotency key must contain between 1 and 200 characters.");
  }

  return value as IdempotencyKey;
}

export function createExecutionHash(
  orgId: string,
  petId: string,
  actionType: string,
  idempotencyKey: IdempotencyKey,
): string {
  return createHash("sha256")
    .update(`${orgId}:${petId}:${actionType}:${idempotencyKey}`)
    .digest("hex");
}
