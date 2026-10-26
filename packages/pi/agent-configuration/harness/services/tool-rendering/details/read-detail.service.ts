import { DONE_DETAIL_LABEL } from "../../../constants/tool-rendering/details/done-detail-label.constant.ts";
import { firstLine } from "../text/first-line.service.ts";

export function readDetail(text: string): string {
  const head = firstLine(text);
  const structure = /\((\d+) lines, \d+ bytes\).*structure only/.exec(head);
  if (structure) return `${structure[1]} lines (structure)`;
  const range = /\(lines (\d+)-(\d+) of (\d+)\)/.exec(head);
  if (range) return `lines ${range[1]}-${range[2]} of ${range[3]}`;
  const total = /\((\d+) lines\)/.exec(head);
  if (total) return `${total[1]} lines`;
  return DONE_DETAIL_LABEL;
}
