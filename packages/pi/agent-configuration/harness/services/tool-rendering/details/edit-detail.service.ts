import { DONE_DETAIL_LABEL } from "../../../constants/tool-rendering/details/done-detail-label.constant.ts";

export function editDetail(text: string): string {
  const diff = /\+(\d+) -(\d+)/.exec(text);
  if (diff) return `+${diff[1]} -${diff[2]}`;
  if (text.startsWith("Moved:")) {
    const movedPath = text.split(/\r?\n/)[1];
    return movedPath === undefined ? "Moved" : movedPath.trim();
  }
  return DONE_DETAIL_LABEL;
}
