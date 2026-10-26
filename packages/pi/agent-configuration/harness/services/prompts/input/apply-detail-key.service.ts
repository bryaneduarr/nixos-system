import { matchesKey } from "@earendil-works/pi-tui";
import {
  KEY_DOWN,
  KEY_G,
  KEY_J,
  KEY_K,
  KEY_SHIFT_G,
  KEY_UP,
  KEY_Y,
} from "../../../constants/keys/key-name.constant.ts";
import type { DetailKeyContext } from "../../../types/prompts/input/detail-key-context.interface.ts";
import type { DetailMotion } from "../../../types/prompts/input/detail-motion.interface.ts";
import { moveVertical } from "../display/move-vertical.service.ts";

function halfPageRows(context: DetailKeyContext): number {
  return Math.max(1, Math.floor(context.pageSize / 2));
}

const detailMotions: readonly DetailMotion[] = [
  { keys: ["v"], run: ({ navigation }) => navigation.toggleSelection("character") },
  { keys: ["shift+v"], run: ({ navigation }) => navigation.toggleSelection("line") },
  { keys: ["h", "left"], run: ({ navigation }) => navigation.move(navigation.cursor - 1) },
  { keys: ["l", "right"], run: ({ navigation }) => navigation.move(navigation.cursor + 1) },
  { keys: [KEY_J, KEY_DOWN], run: ({ navigation, rows }) => moveVertical(navigation, rows(), 1) },
  { keys: [KEY_K, KEY_UP], run: ({ navigation, rows }) => moveVertical(navigation, rows(), -1) },
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

export function applyDetailKey(sequence: string, context: DetailKeyContext): boolean {
  const navigation = context.navigation;
  const pending = navigation.pending;
  navigation.pending = "";
  if (matchesKey(sequence, KEY_G)) {
    if (pending === KEY_G) navigation.move(0);
    else navigation.pending = KEY_G;
    return true;
  }
  if (matchesKey(sequence, KEY_Y)) {
    const selection = navigation.selectedText();
    if (selection.found) context.copy(selection.text);
    else if (pending === KEY_Y) context.copy(navigation.text.slice(...navigation.lineRange(navigation.cursor)));
    else navigation.pending = KEY_Y;
    return true;
  }
  if (matchesKey(sequence, KEY_SHIFT_G) && pending === KEY_Y) {
    context.copy(navigation.text.slice(navigation.lineRange(navigation.cursor)[0]));
    return true;
  }
  const motion = detailMotions.find((candidate) => candidate.keys.some((key) => matchesKey(sequence, key)));
  if (motion === undefined) return false;
  motion.run(context);
  return true;
}
