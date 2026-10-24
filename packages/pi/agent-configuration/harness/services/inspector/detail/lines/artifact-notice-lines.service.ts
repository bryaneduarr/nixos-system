import { BLANK_DETAIL_LINE } from "../../../../constants/inspector/detail/detail-line.constant.ts";
import { THEME_MUTED } from "../../../../constants/split-view/theme-color.constant.ts";
import type { ToolActivity } from "../../../../types/activity/store/tool-activity.interface.ts";
import type { DetailArtifact } from "../../../../types/inspector/detail/detail-artifact.interface.ts";
import type { DetailLine } from "../../../../types/inspector/detail/detail-line.interface.ts";

export function artifactNoticeLines(entry: ToolActivity, artifact: DetailArtifact): DetailLine[] {
  if (!entry.artifactPath.found) return [];
  const artifactAction = artifact.kind === "loaded" ? "open" : "press a";
  return [
    { text: `artifact ${artifactAction}  ${entry.artifactPath.path}`, color: THEME_MUTED, bold: false },
    BLANK_DETAIL_LINE,
  ];
}
