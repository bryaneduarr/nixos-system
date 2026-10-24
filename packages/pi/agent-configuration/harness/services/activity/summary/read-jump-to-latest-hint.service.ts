import { getKeybindings } from "@earendil-works/pi-tui";
import { JUMP_TO_LATEST_KEYBINDING } from "../../../constants/activity/summary/summary-keybinding.constant.ts";
import { JUMP_TO_LATEST_LABEL } from "../../../constants/activity/summary/summary-label.constant.ts";
import { DOT_SEPARATOR } from "../../../constants/text/separator.constant.ts";

export function readJumpToLatestHint(): string {
  const shortcut = getKeybindings().getKeys(JUMP_TO_LATEST_KEYBINDING).map(capitalizeKeyParts).join("/");
  return shortcut === "" ? JUMP_TO_LATEST_LABEL : `${shortcut}${DOT_SEPARATOR}${JUMP_TO_LATEST_LABEL}`;
}

function capitalizeKeyParts(key: string): string {
  return key
    .split("+")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("+");
}
