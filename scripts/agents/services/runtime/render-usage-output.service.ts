import type { UsageOutput } from "../../types/cli/arguments/command-arguments.interface.ts";
import type { TerminalSettings } from "../../types/runtime/terminal-settings.interface.ts";
import type { UsageSnapshot } from "../../types/runtime/usage-snapshot.interface.ts";
import { buildUsageJson } from "../usage/json/build-usage-json.service.ts";
import { renderUsageCards } from "../usage/render/render-usage-cards.service.ts";

export function renderUsageOutput(output: UsageOutput, snapshot: UsageSnapshot, settings: TerminalSettings): string {
  switch (output) {
    case "cards":
      return renderUsageCards({
        usages: snapshot.usages,
        now: snapshot.now,
        colorEnabled: settings.colorEnabled,
        width: settings.width,
      });
    case "json":
      return buildUsageJson(snapshot.usages);
    default: {
      const unhandledOutput: never = output;
      return unhandledOutput;
    }
  }
}
