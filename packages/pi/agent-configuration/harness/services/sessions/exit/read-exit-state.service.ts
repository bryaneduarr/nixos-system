import { EXIT_STATE_KEY } from "../../../constants/sessions/exit.constant.ts";
import type { ExitCancellation, ExitState } from "../../../types/sessions/exit/exit-state.interface.ts";
import { isObjectRecord } from "../herdr/is-object-record.service.ts";

const EXIT_STATE_SYMBOL = Symbol.for(EXIT_STATE_KEY);

export function readExitState(): ExitState {
  const existing: unknown = Reflect.get(globalThis, EXIT_STATE_SYMBOL);
  if (isExitState(existing)) return existing;
  const created: ExitState = { generation: 0, busy: false, requested: false, cancellation: { scheduled: false } };
  Reflect.set(globalThis, EXIT_STATE_SYMBOL, created);
  return created;
}

function isExitState(value: unknown): value is ExitState {
  if (!isObjectRecord(value)) return false;
  const hasCounters = typeof value.generation === "number";
  const hasFlags = typeof value.busy === "boolean" && typeof value.requested === "boolean";
  return hasCounters && hasFlags && isExitCancellation(value.cancellation);
}

function isExitCancellation(value: unknown): value is ExitCancellation {
  if (!isObjectRecord(value)) return false;
  if (value.scheduled === false) return true;
  return value.scheduled === true && typeof value.cancel === "function";
}
