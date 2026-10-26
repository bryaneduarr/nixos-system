import { HIDE_CURSOR_SEQUENCE, SHOW_CURSOR_SEQUENCE } from "../../constants/runtime/terminal-sequence.constant.ts";
import { WATCH_REFRESH_MILLISECONDS } from "../../constants/runtime/watch.constant.ts";
import type {
  CardsLoadOutcome,
  QuitOutcome,
  RefreshPauseOutcome,
} from "../../types/runtime/watch-outcome.interface.ts";
import type { WatchScreenCards } from "../../types/runtime/watch-screen-cards.interface.ts";
import type { WatchUsageInput } from "../../types/runtime/watch-usage.interface.ts";
import { buildInPlaceReplacement } from "./build-in-place-replacement.service.ts";
import { countPhysicalRows } from "./count-physical-rows.service.ts";
import { showSpinnerWhileWaiting } from "./show-spinner-while-waiting.service.ts";

export async function watchUsage(input: WatchUsageInput): Promise<void> {
  input.stdout.write(HIDE_CURSOR_SEQUENCE);
  try {
    await refreshUntilQuit(input);
  } finally {
    input.stdout.write(SHOW_CURSOR_SEQUENCE);
  }
}

async function refreshUntilQuit(input: WatchUsageInput): Promise<void> {
  const quitOutcome = input.quitRequested.then((): QuitOutcome => ({ state: "quit" }));
  let previousFrame = "";
  let screenCards: WatchScreenCards = { state: "empty" };
  for (;;) {
    const load = await loadCardsOrQuit(input, quitOutcome, screenCards.state === "empty");
    if (load.state === "quit") return;
    if (load.state === "loaded") screenCards = { state: "shown", cards: load.cards };
    const footerLine = load.state === "loaded" ? input.footerLine : input.failedFooterLine;
    const frame = buildWatchFrame(screenCards, footerLine);
    input.stdout.write(buildInPlaceReplacement(countPhysicalRows(previousFrame, input.stdout.columns), frame));
    previousFrame = frame;
    const pause = await Promise.race([waitForNextRefresh(input), quitOutcome]);
    if (pause.state === "quit") return;
  }
}

async function loadCardsOrQuit(
  input: WatchUsageInput,
  quitOutcome: Promise<QuitOutcome>,
  showsSpinner: boolean,
): Promise<CardsLoadOutcome> {
  const loading = Promise.race([readCards(input), quitOutcome]);
  return showsSpinner ? showSpinnerWhileWaiting(loading, input.stderr) : loading;
}

async function readCards(input: WatchUsageInput): Promise<CardsLoadOutcome> {
  try {
    return { state: "loaded", cards: await input.loadCards() };
  } catch {
    return { state: "failed" };
  }
}

async function waitForNextRefresh(input: WatchUsageInput): Promise<RefreshPauseOutcome> {
  await input.wait(WATCH_REFRESH_MILLISECONDS);
  return { state: "elapsed" };
}

function buildWatchFrame(screenCards: WatchScreenCards, footerLine: string): string {
  return screenCards.state === "shown" ? `${screenCards.cards}\n\n${footerLine}\n` : `${footerLine}\n`;
}
