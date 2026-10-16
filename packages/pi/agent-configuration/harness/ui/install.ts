import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { installActivity } from "./activity/events.ts";
import { installPromptPreviews } from "../services/prompts/install-prompt-previews.service.ts";
import { installWorking } from "./working.ts";

export function installHarnessPresentation(pi: ExtensionAPI): void {
  installActivity(pi);
  installWorking(pi);
  installPromptPreviews(pi);
}
