import { matchesKey } from "@earendil-works/pi-tui";
import type { InspectorInput } from "../../../types/inspector/input/inspector-input.interface.ts";
import type { InspectorPage } from "../../../types/inspector/navigation/inspector-page.interface.ts";

const PAGE_BY_KEY: Record<string, InspectorPage> = {
  "1": "tools",
  "2": "subagents",
  "3": "messages",
};

export function handleInspectorKey(data: string, inspector: InspectorInput): void {
  if (matchesKey(data, "escape") || matchesKey(data, "ctrl+c") || data === "q") {
    inspector.close();
    return;
  }
  const destinationPage = PAGE_BY_KEY[data];
  if (destinationPage) {
    inspector.switchPage(destinationPage);
    return;
  }
  if (matchesKey(data, "tab")) {
    inspector.switchFocus();
    return;
  }
  if (matchesKey(data, "left") || matchesKey(data, "right") || data === "h" || data === "l") {
    handleHorizontalKey(data, inspector);
    return;
  }
  if (data === "c") {
    inspector.copy();
    return;
  }
  if (data === "a") {
    inspector.toggleArtifact();
    return;
  }
  handleMovementKey(data, inspector);
}

function handleHorizontalKey(data: string, inspector: InspectorInput): void {
  const direction = matchesKey(data, "left") || data === "h" ? "left" : "right";
  if (inspector.page === "subagents" && direction === "right") {
    inspector.openSubagent();
    return;
  }
  if (inspector.page === "tools" && inspector.collapse(direction)) return;
  inspector.switchFocus();
}

function handleMovementKey(data: string, inspector: InspectorInput): void {
  if (matchesKey(data, "pageDown")) {
    inspector.step(inspector.pageSize());
  } else if (matchesKey(data, "pageUp")) {
    inspector.step(-inspector.pageSize());
  } else if (matchesKey(data, "down") || data === "j") {
    inspector.step(1);
  } else if (matchesKey(data, "up") || data === "k") {
    inspector.step(-1);
  } else if (data === "g") {
    inspector.jump("start");
  } else if (data === "G") {
    inspector.jump("end");
  }
}
