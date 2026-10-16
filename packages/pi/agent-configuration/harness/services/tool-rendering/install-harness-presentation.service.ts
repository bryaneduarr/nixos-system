import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { installActivityEvents } from "../activity/events/install-activity-events.service.ts";
import { installPromptPreviews } from "../prompts/install-prompt-previews.service.ts";
import { installWorkingEvents } from "./events/install-working-events.service.ts";

export function installHarnessPresentation(pi: ExtensionAPI): void {
  installActivityEvents(pi);
  installWorkingEvents(pi);
  installPromptPreviews(pi);
}
