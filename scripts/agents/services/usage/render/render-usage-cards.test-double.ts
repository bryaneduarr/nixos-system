import type { ProviderUsage } from "../../../types/usage/provider-usage.interface.ts";
import { renderUsageCards } from "./render-usage-cards.service.ts";

export const now = new Date("2026-10-25T12:00:00Z");

export const wideWidth = 80;

export const wideInnerWidth = 76;

export const filledCell = "█";

export const emptyCell = "░";

export const claudeUsage: ProviderUsage = {
  status: "ok",
  provider: "claude",
  plan: { state: "reported", name: "max" },
  windows: [
    { label: "Session", percentRemaining: 97, resetsAt: "2026-10-25T16:12:00Z" },
    { label: "Weekly", percentRemaining: 50, resetsAt: "2026-10-28T16:12:00Z" },
    { label: "Opus weekly", percentRemaining: 0, resetsAt: "2026-10-26T11:59:00Z" },
  ],
};

export const unplannedClaudeUsage: ProviderUsage = {
  status: "ok",
  provider: "claude",
  plan: { state: "unreported" },
  windows: [{ label: "Weekly", percentRemaining: 80, resetsAt: "2026-10-28T16:12:00Z" }],
};

export const notSignedInUsage: ProviderUsage = {
  status: "not-signed-in",
  provider: "claude",
  message: "Sign in to Claude Code by running `claude login`.",
};

export const loginExpiredUsage: ProviderUsage = {
  status: "login-expired",
  provider: "claude",
  message: "Claude Code login expired. Sign in again by running `claude`.",
};

export const errorUsage: ProviderUsage = {
  status: "error",
  provider: "opencode",
  message: "OpenCode Go usage request failed with HTTP 500.",
};

export const emptyUsage: ProviderUsage = {
  status: "ok",
  provider: "claude",
  plan: { state: "unreported" },
  windows: [],
};

export const resetUnknownUsage: ProviderUsage = {
  status: "ok",
  provider: "opencode",
  plan: { state: "unreported" },
  windows: [{ label: "Rolling", percentRemaining: 100, resetsAt: "not-a-date" }],
};

export function renderPlain(usages: readonly ProviderUsage[], width = wideWidth): string {
  return renderUsageCards({ usages, now, colorEnabled: false, width });
}

function boxRow(content: string, innerWidth: number): string {
  return `│ ${content.padEnd(innerWidth)} │`;
}

export function boxCard(lines: readonly string[], innerWidth: number): string {
  const horizontalRule = "─".repeat(innerWidth + 2);
  return [`╭${horizontalRule}╮`, ...lines.map((line) => boxRow(line, innerWidth)), `╰${horizontalRule}╯`].join("\n");
}
