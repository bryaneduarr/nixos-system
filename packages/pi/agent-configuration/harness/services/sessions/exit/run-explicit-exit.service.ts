import {
  HERDR_ENVIRONMENT_VARIABLE,
  PI_INTERACTIVE_MODE,
} from "../../../constants/sessions/install/environment.constant.ts";
import type { ExitCancellation } from "../../../types/sessions/exit/exit-cancellation.interface.ts";
import type { ExitContext } from "../../../types/sessions/exit/exit-context.interface.ts";
import type { ExitDependencies } from "../../../types/sessions/exit/exit-dependencies.interface.ts";
import type { UnscheduledCleanup } from "../../../types/sessions/exit/unscheduled-cleanup.interface.ts";
import { confirmAdditionalDiscard } from "./confirm-additional-discard.service.ts";
import { confirmExit } from "./confirm-exit.service.ts";
import { listDiscardReasons } from "./list-discard-reasons.service.ts";
import { readExitState } from "./read-exit-state.service.ts";
import { scheduleHerdrExit } from "./schedule-herdr-exit.service.ts";

const UNSCHEDULED: UnscheduledCleanup = { scheduled: false };

export async function runExplicitExit(ctx: ExitContext, dependencies: ExitDependencies): Promise<void> {
  const state = readExitState();
  if (state.busy || state.requested) return;
  if (ctx.mode !== PI_INTERACTIVE_MODE) {
    ctx.ui.notify("/exit requires interactive Pi", "warning");
    return;
  }
  state.busy = true;
  const generation = state.generation;
  const isStale = (): boolean => generation !== state.generation;
  let cancellation: ExitCancellation = UNSCHEDULED;
  const cancelScheduledCleanup = (): void => {
    if (cancellation.scheduled) cancellation.cancel();
  };
  try {
    const reasons = listDiscardReasons(ctx);
    if (!(await confirmExit(ctx, reasons))) return;
    if (isStale()) return;
    if (process.env[HERDR_ENVIRONMENT_VARIABLE]) cancellation = await scheduleHerdrExit(dependencies);
    if (isStale()) {
      cancelScheduledCleanup();
      return;
    }
    const changedReasons = listDiscardReasons(ctx).filter((reason) => !reasons.includes(reason));
    if (!(await confirmAdditionalDiscard(ctx, changedReasons))) {
      cancelScheduledCleanup();
      return;
    }
    if (isStale()) {
      cancelScheduledCleanup();
      return;
    }
    state.cancellation = cancellation;
    if (cancellation.scheduled) {
      ctx.ui.notify(
        "Exiting Pi. If the pane stays open, the helper could not verify safe closure. Check its processes before closing it manually.",
        "info",
      );
    }
    state.requested = true;
    ctx.shutdown();
    ctx.abort();
  } catch (error) {
    cancelScheduledCleanup();
    if (isStale()) return;
    state.cancellation = UNSCHEDULED;
    state.requested = false;
    ctx.ui.notify(
      `Exit cancelled: ${String(error)}. Check the Herdr socket and pane process information, then retry /exit. Use Pi's built-in Ctrl+D to exit without closing the pane.`,
      "error",
    );
  } finally {
    if (!isStale()) state.busy = false;
  }
}
