import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { UPDATE_ACTIVITY_NAME } from "../../../constants/activity/activity-entry.constant.ts";
import { ACTIVITY_SUMMARY_ENTRY } from "../../../constants/activity/activity-keys.constant.ts";
import { activityStore } from "../store/shared-activity-store.service.ts";

export function installMarkdownTransformerEvents(pi: ExtensionAPI): void {
  // Older sessions stored a summary in the transcript. Its live replacement
  // is an editor widget, so keep these entries invisible on reload.
  pi.registerEntryRenderer(ACTIVITY_SUMMARY_ENTRY, () => undefined);
  pi.registerMarkdownTransformer((markdown, context) => {
    if (context.messageType === "assistant-thinking") return "";
    if (context.messageType !== "assistant") return markdown;
    // Pi's transformer has no message ID or stop reason. Keep streaming text
    // out of the transcript until we know whether this turn calls a tool.
    if (context.isStreaming) return "";
    return isRecordedUpdateText(markdown) ? "" : markdown;
  });
}

function isRecordedUpdateText(markdown: string): boolean {
  return activityStore
    .all()
    .some((entry) => entry.toolName === UPDATE_ACTIVITY_NAME && entry.text.trim() === markdown.trim());
}
