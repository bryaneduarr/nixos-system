import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { installActivityEvents } from "../services/activity/events/install-activity-events.service.ts";
import { installPromptPreviews } from "./prompts/install.ts";
import { installWorking } from "./working.ts";

export function installHarnessPresentation(pi: ExtensionAPI): void {
  installActivityEvents(pi);
  installWorking(pi);
  installPromptPreviews(pi);
}
