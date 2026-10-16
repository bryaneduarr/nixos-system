import type { Theme } from "@earendil-works/pi-coding-agent";
import type { HarnessPresentation } from "../../../types/tool-rendering/harness-presentation.interface.ts";

export function presentationLines(presentation: HarnessPresentation, theme: Theme): string[] {
  const lines = [theme.fg("text", presentation.target)];
  if (presentation.state === "running") {
    lines.push(theme.fg("warning", "Running..."));
    return lines;
  }
  const [first, ...rest] = presentation.details;
  if (presentation.state === "error") {
    lines.push(theme.fg("error", `Failed - ${first ?? "error"}`));
    for (const detail of rest) lines.push(theme.fg("error", detail));
    return lines;
  }
  lines.push(theme.fg("success", `Done - ${first ?? "ok"}`));
  for (const detail of rest) lines.push(theme.fg("muted", detail));
  return lines;
}
