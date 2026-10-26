import { TURN_VIEW_KEY } from "../../../constants/transcript/turn/turn-view.constant.ts";
import type { TurnView } from "../../../types/transcript/turn/turn-view.interface.ts";
import type { TurnViewStore } from "../../../types/transcript/turn/turn-view-store.interface.ts";

const LATEST_TURN_ONLY: TurnView = { hidden: true, turnsFromLatest: 0 };

export function createTurnView(): TurnViewStore {
  let view = LATEST_TURN_ONLY;
  const update = (next: TurnView): void => {
    view = next;
    Reflect.set(globalThis, TURN_VIEW_KEY, view);
  };

  update(view);

  return {
    reset() {
      update(LATEST_TURN_ONLY);
    },
    toggleHidden() {
      update({ ...view, hidden: !view.hidden });
    },
    focus(turnsFromLatest) {
      update({ hidden: true, turnsFromLatest });
    },
    current() {
      return view;
    },
  };
}
