import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { installActivity } from "../../ui/activity/events.ts";
import { installPromptPreviews } from "../prompts/install-prompt-previews.service.ts";
import { installWorkingEvents } from "./events/install-working-events.service.ts";

export function installHarnessPresentation(pi: ExtensionAPI): void {
  installActivity(pi);
  installWorkingEvents(pi);
  installPromptPreviews(pi);
}
