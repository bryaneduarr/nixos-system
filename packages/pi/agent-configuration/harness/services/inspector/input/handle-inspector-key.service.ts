import { matchesKey } from "@earendil-works/pi-tui";
import { FOOTER_LINKS } from "../../../constants/inspector/footer.constant.ts";
import type { InspectorInput } from "../../../types/inspector/input/inspector-input.interface.ts";

export function handleInspectorKey(data: string, inspector: InspectorInput): void {
  const isCloseKey = matchesKey(data, "escape") || matchesKey(data, "ctrl+c") || data === "q";
  if (isCloseKey) {
    inspector.close();
    return;
  }
  const destinationLink = FOOTER_LINKS.find((link) => link.key === data);
  if (destinationLink) {
    inspector.switchPage(destinationLink.page);
    return;
  }
  if (matchesKey(data, "tab")) {
    inspector.switchFocus();
    return;
  }
  const canOpenSubagent = inspector.page === "subagents" || inspector.page === "tools";
  if (matchesKey(data, "enter") && canOpenSubagent) {
    inspector.openSubagent();
    return;
  }
  const isArrowKey = matchesKey(data, "left") || matchesKey(data, "right");
  const isVimKey = data === "h" || data === "l";
  const isHorizontalKey = isArrowKey || isVimKey;
  if (isHorizontalKey) {
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
  const isLeftKey = matchesKey(data, "left") || data === "h";
  const direction = isLeftKey ? "left" : "right";
  if (inspector.page === "subagents" && direction === "right") {
    inspector.openSubagent();
    return;
  }
  const isLeavingSubagent = inspector.page === "subagent" && direction === "left" && inspector.focus === "list";
  if (isLeavingSubagent) {
    inspector.switchPage("subagents");
    return;
  }
  if (inspector.page === "tools" && inspector.collapse(direction)) return;
  inspector.switchFocus();
}

function handleMovementKey(data: string, inspector: InspectorInput): void {
  const halfPage = Math.max(1, Math.floor(inspector.pageSize() / 2));
  if (matchesKey(data, "pageDown")) {
    inspector.step(inspector.pageSize());
  } else if (matchesKey(data, "pageUp")) {
    inspector.step(-inspector.pageSize());
  } else if (matchesKey(data, "ctrl+d")) {
    inspector.step(halfPage);
  } else if (matchesKey(data, "ctrl+u")) {
    inspector.step(-halfPage);
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
