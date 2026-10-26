import { randomUUID } from "node:crypto";
import type { Theme } from "@earendil-works/pi-coding-agent";
import { BOX_SIDE_CHROME_WIDTH, MAX_BOX_WIDTH } from "../../../constants/tool-rendering/box/box-width.constant.ts";
import { WARNING_BOX_TITLE } from "../../../constants/transcript/warning-renderer.constant.ts";
import { recordWarning } from "../../activity/record/record-warning.service.ts";
import { boxLines } from "../../tool-rendering/box/box-lines.service.ts";
import { previewTextLines } from "../preview/preview-text-lines.service.ts";

export function createWarningRendererFactory(
  cwd: string,
  theme: Pick<Theme, "fg">,
): (warningMessage: string) => (width: number) => string[] {
  return (warningMessage) => {
    recordWarning({ id: `warning-${randomUUID()}`, message: warningMessage, cwd, occurredAt: Date.now() });
    return (width) => {
      const contentWidth = Math.max(1, Math.min(width, MAX_BOX_WIDTH) - BOX_SIDE_CHROME_WIDTH);
      const lines = previewTextLines(warningMessage, contentWidth);
      return ["", ...boxLines(width, WARNING_BOX_TITLE, lines).map((line) => theme.fg("warning", line))];
    };
  };
}
