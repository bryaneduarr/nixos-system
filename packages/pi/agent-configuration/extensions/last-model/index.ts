import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { installModelSelectionEvents } from "./services/model-selection/events/install-model-selection-events.service.ts";

export default function lastModelExtension(pi: ExtensionAPI): void {
  installModelSelectionEvents(pi);
}
