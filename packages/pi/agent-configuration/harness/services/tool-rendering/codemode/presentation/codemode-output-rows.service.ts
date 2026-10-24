import { plural } from "../../text/plural.service.ts";
import { stripScriptHeader } from "../script/strip-script-header.service.ts";

export function codemodeOutputRows(text: string): string[] {
  const output = stripScriptHeader(text);
  if (output === "") return [];
  return [`Output: ${plural(output.split(/\r?\n/).length, "line")}, ${plural(output.length, "char")}`];
}
