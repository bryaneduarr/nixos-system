import type { SubagentCardTheme } from "../../types/subagents/card/subagent-card-theme.interface.ts";

export const plainSubagentCardTheme: SubagentCardTheme = {
  fg: (_color, text) => text,
  bold: (text) => text,
};

export const noLiveProgress = { found: false } as const;
export const noPreviousComponent = { state: "absent" } as const;
