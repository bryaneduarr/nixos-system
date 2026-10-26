import { createTurnView } from "../../services/transcript/turn/create-turn-view.service.ts";
import type { TurnViewStore } from "../../types/transcript/turn/turn-view-store.interface.ts";

export const turnView: TurnViewStore = createTurnView();
