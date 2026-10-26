import {
  C1_CONTROL_MAX,
  CONTROL_CHARACTER_MAX,
  DELETE_CHARACTER,
} from "../../../../constants/sessions/menu/menu.constant.ts";

export function terminalLabel(text: string): string {
  return [...text].map((character) => (isControlCharacter(character) ? " " : character)).join("");
}

function isControlCharacter(character: string): boolean {
  const code = character.codePointAt(0);
  if (code === undefined) return false;
  return code <= CONTROL_CHARACTER_MAX || (code >= DELETE_CHARACTER && code <= C1_CONTROL_MAX);
}
