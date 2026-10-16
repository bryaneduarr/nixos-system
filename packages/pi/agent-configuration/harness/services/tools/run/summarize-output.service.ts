import type { OutputSummary } from "../../../types/tools/run/output-summary.interface.ts";
import { splitLines } from "../text/split-lines.service.ts";

export function summarizeOutput(output: string): OutputSummary {
  const lines = splitLines(output);
  const tsErrors = lines.filter((line) => /error TS\d+/.test(line)).length;
  const genericErrors = lines.filter((line) => /(^|\s)(error|failed|exception):/i.test(line)).length;
  const parts: string[] = [];
  if (tsErrors > 0) parts.push(`TypeScript errors: ${tsErrors}`);
  if (genericErrors > 0) parts.push(`error lines: ${genericErrors}`);
  return parts.length > 0 ? { found: true, text: parts.join(", ") } : { found: false };
}
