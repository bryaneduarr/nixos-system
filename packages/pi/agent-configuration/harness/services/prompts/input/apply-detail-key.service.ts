import { matchesKey } from "@earendil-works/pi-tui";
import { KEY_G, KEY_SHIFT_G, KEY_Y } from "../../../constants/prompts/keys.constant.ts";
import type { DetailKeyContext } from "../../../types/prompts/detail-key-context.interface.ts";
import type { DetailMotion } from "../../../types/prompts/detail-motion.interface.ts";
import { moveVertical } from "../layout/move-vertical.service.ts";

function halfPageRows(context: DetailKeyContext): number {
  return Math.max(1, Math.floor(context.pageSize / 2));
}

const detailMotions: readonly DetailMotion[] = [
  { keys: ["v"], run: ({ navigation }) => navigation.toggleSelection("character") },
  { keys: ["shift+v"], run: ({ navigation }) => navigation.toggleSelection("line") },
  { keys: ["h", "left"], run: ({ navigation }) => navigation.move(navigation.cursor - 1) },
  { keys: ["l", "right"], run: ({ navigation }) => navigation.move(navigation.cursor + 1) },
  { keys: ["j", "down"], run: ({ navigation, rows }) => moveVertical(navigation, rows(), 1) },
  { keys: ["k", "up"], run: ({ navigation, rows }) => moveVertical(navigation, rows(), -1) },
  { keys: ["w"], run: ({ navigation }) => navigation.word(1) },
  { keys: ["b"], run: ({ navigation }) => navigation.word(-1) },
  { keys: ["0"], run: ({ navigation }) => navigation.lineEdge(false) },
  { keys: ["$"], run: ({ navigation }) => navigation.lineEdge(true) },
  { keys: ["home"], run: ({ navigation }) => navigation.move(0) },
  { keys: [KEY_SHIFT_G, "end"], run: ({ navigation }) => navigation.move(navigation.units.length - 1) },
  { keys: ["ctrl+d"], run: (context) => moveVertical(context.navigation, context.rows(), halfPageRows(context)) },
  { keys: ["ctrl+u"], run: (context) => moveVertical(context.navigation, context.rows(), -halfPageRows(context)) },
  { keys: ["pageDown"], run: (context) => moveVertical(context.navigation, context.rows(), context.pageSize) },
  { keys: ["pageUp"], run: (context) => moveVertical(context.navigation, context.rows(), -context.pageSize) },
];

export function applyDetailKey(data: string, context: DetailKeyContext): boolean {
  const navigation = context.navigation;
  const pending = navigation.pending;
  navigation.pending = "";
  if (matchesKey(data, KEY_G)) {
    if (pending === KEY_G) navigation.move(0);
    else navigation.pending = KEY_G;
    return true;
  }
  if (matchesKey(data, KEY_Y)) {
    const selection = navigation.selectedText();
    if (selection.found) context.copy(selection.text);
    else if (pending === KEY_Y) context.copy(navigation.text.slice(...navigation.lineRange(navigation.cursor)));
    else navigation.pending = KEY_Y;
    return true;
  }
  if (matchesKey(data, KEY_SHIFT_G) && pending === KEY_Y) {
    context.copy(navigation.text.slice(navigation.lineRange(navigation.cursor)[0]));
    return true;
  }
  const motion = detailMotions.find((candidate) => candidate.keys.some((key) => matchesKey(data, key)));
  if (motion === undefined) return false;
  motion.run(context);
  return true;
}
