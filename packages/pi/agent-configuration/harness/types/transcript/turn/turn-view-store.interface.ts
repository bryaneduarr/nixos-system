import type { TurnView } from "./turn-view.interface.ts";

/** Holds the turn view and mirrors it where the patched transcript reads it. */
export interface TurnViewStore {
  /** Hides every turn except the latest one. */
  reset(): void;
  /** Flips between the focused turn and the whole transcript. */
  toggleHidden(): void;
  /** Hides every turn except the one this many turns before the latest. */
  focus(turnsFromLatest: number): void;
  /** Current turn view. */
  current(): TurnView;
}
