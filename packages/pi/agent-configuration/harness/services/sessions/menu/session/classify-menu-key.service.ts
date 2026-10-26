import { matchesKey } from "@earendil-works/pi-tui";
import { KEY_CTRL_C, KEY_ENTER, KEY_ESCAPE } from "../../../../constants/keys/key-name.constant.ts";
import { MENU_KEY_FILTER, MENU_NEW_SESSION_INPUTS } from "../../../../constants/sessions/menu/menu-keys.constant.ts";
import type { MenuKeyAction } from "../../../../types/sessions/menu/session/menu-key-action.interface.ts";

export function classifyMenuKey(data: string, filtering: boolean): MenuKeyAction {
  const isEscape = matchesKey(data, KEY_ESCAPE);
  const isEnter = matchesKey(data, KEY_ENTER);
  if (filtering) return isEscape || isEnter ? "stop-filtering" : "edit-filter";
  if (isEscape || matchesKey(data, KEY_CTRL_C)) return "cancel";
  if (MENU_NEW_SESSION_INPUTS.includes(data)) return "new-session";
  if (matchesKey(data, MENU_KEY_FILTER)) return "start-filtering";
  if (isEnter) return "choose";
  return "move-selection";
}
