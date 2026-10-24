import type { LeadingCd } from "../../../types/tools/run/leading-cd.interface.ts";

const LEADING_CD_PATTERN = /^\s*cd\s+("([^"$`\\]+)"|'([^']+)'|([^\s;&|$`()<>"'\\]+))\s*(?:&&|;)\s*([\s\S]*\S[\s\S]*)$/;

export function splitLeadingCd(command: string): LeadingCd {
  const match = LEADING_CD_PATTERN.exec(command);
  if (!match) return { kind: "none" };

  const [, , doubleQuoted, singleQuoted, bare, rest] = match;
  const directory = doubleQuoted ?? singleQuoted ?? bare;
  if (directory === undefined || rest === undefined) return { kind: "none" };

  return { kind: "split", directory, command: rest.trim() };
}
