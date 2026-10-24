import type { Theme } from "@earendil-works/pi-coding-agent";
import { THEME_MUTED, THEME_TEXT } from "../../../constants/split-view/theme-color.constant.ts";
import { DONE_DETAIL_LABEL } from "../../../constants/tool-rendering/details/done-detail-label.constant.ts";
import {
  ERROR_DETAIL_FALLBACK,
  FAILED_LABEL,
  OK_DETAIL_FALLBACK,
  PRESENTATION_RUNNING_LABEL,
} from "../../../constants/tool-rendering/presentation/presentation-label.constant.ts";
import type { HarnessPresentation } from "../../../types/tool-rendering/presentation/harness-presentation.interface.ts";

export function presentationLines(presentation: HarnessPresentation, theme: Theme): string[] {
  const lines = [theme.fg(THEME_TEXT, presentation.target)];
  if (presentation.state === "running") {
    lines.push(theme.fg("warning", PRESENTATION_RUNNING_LABEL));
    for (const detail of presentation.details) lines.push(theme.fg(THEME_MUTED, detail));
    return lines;
  }
  const [first, ...rest] = presentation.details;
  if (presentation.state === "error") {
    lines.push(theme.fg("error", `${FAILED_LABEL} - ${first ?? ERROR_DETAIL_FALLBACK}`));
    for (const detail of rest) lines.push(theme.fg("error", detail));
    return lines;
  }
  lines.push(theme.fg("success", `${DONE_DETAIL_LABEL} - ${first ?? OK_DETAIL_FALLBACK}`));
  for (const detail of rest) lines.push(theme.fg(THEME_MUTED, detail));
  return lines;
}
