import { matchesKey } from "@earendil-works/pi-tui";
import { FOOTER_LINKS } from "../../../constants/inspector/lists/footer.constant.ts";
import {
  KEY_CTRL_C,
  KEY_DOWN,
  KEY_ENTER,
  KEY_ESCAPE,
  KEY_G,
  KEY_H,
  KEY_J,
  KEY_K,
  KEY_LEFT,
  KEY_RIGHT,
  KEY_TAB,
  KEY_UP,
} from "../../../constants/keys/key-name.constant.ts";
import type { InspectorInput } from "../../../types/inspector/input/inspector-input.interface.ts";

export function handleInspectorKey(data: string, inspector: InspectorInput): void {
  const isCloseKey = matchesKey(data, KEY_ESCAPE) || matchesKey(data, KEY_CTRL_C) || data === "q";
  if (isCloseKey) {
    inspector.close();
    return;
  }
  const destinationLink = FOOTER_LINKS.find((link) => link.key === data);
  if (destinationLink) {
    inspector.switchPage(destinationLink.page);
    return;
  }
  if (matchesKey(data, KEY_TAB)) {
    inspector.switchFocus();
    return;
  }
  const canOpenSubagent = inspector.page === "subagents" || inspector.page === "tools";
  if (matchesKey(data, KEY_ENTER) && canOpenSubagent) {
    inspector.openSubagent();
    return;
  }
  const isArrowKey = matchesKey(data, KEY_LEFT) || matchesKey(data, KEY_RIGHT);
  const isVimKey = data === KEY_H || data === "l";
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
  const isLeftKey = matchesKey(data, KEY_LEFT) || data === KEY_H;
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
  } else if (matchesKey(data, KEY_DOWN) || data === KEY_J) {
    inspector.step(1);
  } else if (matchesKey(data, KEY_UP) || data === KEY_K) {
    inspector.step(-1);
  } else if (data === KEY_G) {
    inspector.jump("start");
  } else if (data === "G") {
    inspector.jump("end");
  }
}
