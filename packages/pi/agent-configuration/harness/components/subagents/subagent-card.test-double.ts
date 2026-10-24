import type { Component } from "@earendil-works/pi-tui";
import { activityStore } from "../../stores/activity/activity.store.ts";
import { activityVisibility } from "../../stores/activity/activity-visibility.store.ts";
import type { ValueState } from "../../types/activity/value/value-state.interface.ts";
import type { SubagentCardTheme } from "../../types/subagents/card/subagent-card-theme.interface.ts";
import { renderSubagentCard } from "./subagent-card.component.ts";

export const TEST_CWD = "/tmp";

const plainSubagentCardTheme: SubagentCardTheme = {
  fg: (_color, text) => text,
  bold: (text) => text,
};

export function resetCardStores(): void {
  activityStore.clear();
  activityVisibility.reset();
  activityVisibility.setAgentWorking(true);
}

function renderCard(toolCallId: string, title: string, lastComponent: ValueState<Component>): Component {
  return renderSubagentCard({
    theme: plainSubagentCardTheme,
    toolCallId,
    title,
    progressLookup: { found: false },
    lastComponent,
  });
}

export function renderPlainCard(toolCallId: string, title: string): Component {
  return renderCard(toolCallId, title, { state: "absent" });
}

export function renderPlainCardAgain(toolCallId: string, title: string, previous: Component): Component {
  return renderCard(toolCallId, title, { state: "present", value: previous });
}
