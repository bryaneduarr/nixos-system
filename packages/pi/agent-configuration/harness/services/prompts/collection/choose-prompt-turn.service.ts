import type { ChoosePromptTurnRequest } from "../../../types/prompts/collection/choose-prompt-turn-request.interface.ts";

export function choosePromptTurn(request: ChoosePromptTurnRequest): boolean {
  const { selection, items, selected, done } = request;
  const item = items[selected];
  if (selection.kind !== "choose-turn" || item === undefined || item.turn.kind !== "turn") return false;
  done();
  selection.choose(item.turn.turnsFromLatest);
  return true;
}
