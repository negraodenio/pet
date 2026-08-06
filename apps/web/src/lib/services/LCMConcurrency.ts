export declare const lcmVersionBrand: unique symbol;

export type LCMVersion = number & {
  readonly [lcmVersionBrand]: "LCMVersion";
};

export function toLCMVersion(value: number): LCMVersion {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Invalid LCM version: ${value}`);
  }

  return value as LCMVersion;
}

export class ConcurrencyConflictError extends Error {
  constructor(readonly petId: string, readonly attempts: number) {
    super(`LCM update for pet ${petId} conflicted after ${attempts} attempts.`);
    this.name = "ConcurrencyConflictError";
  }
}

export class DuplicateEventError extends Error {
  constructor(readonly eventId: string) {
    super(`Timeline event ${eventId} was already processed by the LCM.`);
    this.name = "DuplicateEventError";
  }
}

export class OutOfOrderEventError extends Error {
  constructor(readonly eventId: string, readonly lastProcessedEventId: string | null) {
    super(`Timeline event ${eventId} is older than the LCM's current state.`);
    this.name = "OutOfOrderEventError";
  }
}

export type ConcurrencyResult<T> =
  | { status: "updated"; state: T }
  | { status: "conflict" };

export type ProcessingResult<T> =
  | { status: "updated"; state: T; attempts: number }
  | { status: "duplicate"; state: T; attempts: number; error: DuplicateEventError }
  | { status: "out_of_order"; state: T; attempts: number; error: OutOfOrderEventError }
  | { status: "skipped"; state: null; attempts: number };
