import { activityStore } from "../../activity/store.ts";
import {
  MESSAGE_ACTIVITY_NAME,
  THINKING_ACTIVITY_NAME,
  UPDATE_ACTIVITY_NAME,
} from "../../constants/activity/activity-entry.constant.ts";

export function safeParseTimestamp(timestamp: unknown): number {
  if (typeof timestamp !== "string") return Date.now();
  const parsed = Date.parse(timestamp);
  return Number.isNaN(parsed) ? Date.now() : parsed;
}

export function recordUserMessage(id: string, content: unknown, cwd: string, startedAt: number): void {
  const text = Array.isArray(content)
    ? content
        .filter(
          (part): part is { type: "text"; text: string } =>
            typeof part === "object" &&
            part !== null &&
            "type" in part &&
            part.type === "text" &&
            "text" in part &&
            typeof part.text === "string",
        )
        .map((part) => part.text)
        .join("\n")
    : typeof content === "string"
      ? content
      : "";
  const number = activityStore.all().filter((entry) => entry.toolName === MESSAGE_ACTIVITY_NAME).length + 1;
  activityStore.begin({ id, toolName: MESSAGE_ACTIVITY_NAME, args: { number }, cwd, startedAt });
  activityStore.finish(id, { text, status: "success", endedAt: startedAt });
}

export function recordUpdate(id: string, text: string, cwd: string, startedAt: number): void {
  if (!text.trim()) return;
  activityStore.begin({ id, toolName: UPDATE_ACTIVITY_NAME, args: {}, cwd, startedAt });
  activityStore.update(id, { text });
}

export function recordThinking(id: string, text: string, cwd: string, startedAt: number): void {
  if (!text) return;
  activityStore.begin({ id, toolName: THINKING_ACTIVITY_NAME, args: {}, cwd, startedAt });
  activityStore.update(id, { text });
}
