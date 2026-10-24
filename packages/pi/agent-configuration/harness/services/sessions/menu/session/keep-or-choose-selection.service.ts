import type { ValueState } from "../../../../types/activity/value/value-state.interface.ts";
import type { LiveSession } from "../../../../types/sessions/registry/row/live-session.interface.ts";

export function keepOrChooseSelection(
  visible: readonly LiveSession[],
  selection: ValueState<string>,
  pid: number,
): ValueState<string> {
  const isSelectionVisible = selection.state === "present" && visible.some((row) => row.identity === selection.value);
  if (isSelectionVisible) return selection;
  const current = visible.find((row) => row.pid === pid);
  if (current) return { state: "present", value: current.identity };
  const first = visible[0];
  return first ? { state: "present", value: first.identity } : { state: "absent" };
}
