import { DONE_DETAIL_LABEL } from "../../../constants/tool-rendering/details/done-detail-label.constant.ts";

export function runDetail(text: string): string {
  const exit = /^exit:\s*(-?\d+)/.exec(text);
  const parts: string[] = [exit ? `exit ${exit[1]}` : DONE_DETAIL_LABEL];
  const tsErrors = /TypeScript errors: (\d+)/.exec(text);
  if (tsErrors) parts.push(`TypeScript ${tsErrors[1]} errors`);
  if (/\btimed out\b/.test(text)) parts.push("timed out");
  else if (/\bterminated\b/.test(text)) parts.push("terminated");
  return parts.join(", ");
}
