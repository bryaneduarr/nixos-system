import type { Theme, ThemeColor } from "@earendil-works/pi-coding-agent";
import type { Component } from "@earendil-works/pi-tui";
import { ToolBox } from "../../../components/tool-rendering/tool-box.component.ts";
import type { ValueState } from "../../../types/activity/value/value-state.interface.ts";

export function reuseOrCreateToolBox(lastComponent: ValueState<Component>, theme: Theme, color: ThemeColor): ToolBox {
  if (lastComponent.state === "present" && lastComponent.value instanceof ToolBox) return lastComponent.value;
  return new ToolBox(theme, "", [], color, true);
}
