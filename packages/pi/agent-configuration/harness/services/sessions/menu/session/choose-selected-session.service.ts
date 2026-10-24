import type { ValueState } from "../../../../types/activity/value/value-state.interface.ts";
import type { MenuSelection } from "../../../../types/sessions/menu/session/menu-selection.interface.ts";
import type { LiveSession } from "../../../../types/sessions/registry/row/live-session.interface.ts";

export function chooseSelectedSession(visible: readonly LiveSession[], selection: ValueState<string>): MenuSelection {
  if (selection.state === "absent") return "cancel";
  const selectedId = selection.value;
  return visible.find((row) => row.identity === selectedId) ?? "cancel";
}
