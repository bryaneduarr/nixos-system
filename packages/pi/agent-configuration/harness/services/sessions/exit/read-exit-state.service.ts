import { EXIT_STATE_KEY } from "../../../constants/sessions/exit/exit.constant.ts";
import type { ExitCancellation } from "../../../types/sessions/exit/exit-cancellation.interface.ts";
import type { ExitState } from "../../../types/sessions/exit/exit-state.interface.ts";
import { isObjectRecord } from "../herdr/response/is-object-record.service.ts";

const EXIT_STATE_SYMBOL = Symbol.for(EXIT_STATE_KEY);

export function readExitState(): ExitState {
  const existing: unknown = Reflect.get(globalThis, EXIT_STATE_SYMBOL);
  if (isExitState(existing)) return existing;
  const created: ExitState = { generation: 0, busy: false, requested: false, cancellation: { scheduled: false } };
  Reflect.set(globalThis, EXIT_STATE_SYMBOL, created);
  return created;
}

function isExitState(candidate: unknown): candidate is ExitState {
  if (!isObjectRecord(candidate)) return false;
  const hasCounters = typeof candidate.generation === "number";
  const hasFlags = typeof candidate.busy === "boolean" && typeof candidate.requested === "boolean";
  return hasCounters && hasFlags && isExitCancellation(candidate.cancellation);
}

function isExitCancellation(candidate: unknown): candidate is ExitCancellation {
  if (!isObjectRecord(candidate)) return false;
  if (candidate.scheduled === false) return true;
  return candidate.scheduled === true && typeof candidate.cancel === "function";
}
