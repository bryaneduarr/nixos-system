import { DIM_SGR } from "../../constants/render/card-color.constant.ts";
import { WATCH_FAILED_FOOTER_TEXT, WATCH_FOOTER_TEXT } from "../../constants/runtime/watch.constant.ts";
import type { UsageCommand } from "../../types/cli/arguments/command-arguments.interface.ts";
import type { WatchRuntime } from "../../types/runtime/usage-runtime.interface.ts";
import { paintText } from "../usage/render/paint-text.service.ts";
import { listenForQuit } from "./listen-for-quit.service.ts";
import { renderUsageOutput } from "./render-usage-output.service.ts";
import { watchUsage } from "./watch-usage.service.ts";

async function readFrame(command: UsageCommand, runtime: WatchRuntime): Promise<string> {
  const snapshot = await runtime.readSnapshot(command.providers);
  return renderUsageOutput(command.output, snapshot, runtime.readSettings());
}

export async function runUsageWatch(command: UsageCommand, runtime: WatchRuntime): Promise<void> {
  const quitListener = listenForQuit({ keys: runtime.stdin, signals: runtime.signals });
  const colorEnabled = runtime.readSettings().colorEnabled;
  const footerLine = paintText({ text: WATCH_FOOTER_TEXT, sgr: DIM_SGR, colorEnabled });
  const failedFooterLine = paintText({ text: WATCH_FAILED_FOOTER_TEXT, sgr: DIM_SGR, colorEnabled });
  try {
    await watchUsage({
      loadCards: () => readFrame(command, runtime),
      stdout: runtime.stdout,
      stderr: runtime.stderr,
      wait: runtime.wait,
      quitRequested: quitListener.quitRequested,
      footerLine,
      failedFooterLine,
    });
  } finally {
    quitListener.dispose();
  }
}
