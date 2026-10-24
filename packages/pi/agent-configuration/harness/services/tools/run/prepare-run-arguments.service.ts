import { Value } from "typebox/value";
import { RawRunArgumentsSchema } from "../../../schemas/tools/run/raw-run-arguments.schema.ts";
import type { RunParameters } from "../../../types/tools/run/run-parameters.interface.ts";
import { splitLeadingCd } from "./split-leading-cd.service.ts";

export function prepareRunArguments(rawArguments: unknown): RunParameters {
  if (!Value.Check(RawRunArgumentsSchema, rawArguments)) {
    throw new Error("run expects { command: string, cwd?: string, timeoutMs?: integer }.");
  }
  const command = rawArguments.command ?? rawArguments.run;
  if (command === undefined) throw new Error("run requires 'command'.");

  const timeout = rawArguments.timeoutMs === undefined ? {} : { timeoutMs: rawArguments.timeoutMs };
  if (rawArguments.cwd !== undefined) return { command, cwd: rawArguments.cwd, ...timeout };

  const leadingCd = splitLeadingCd(command);
  if (leadingCd.kind === "none") return { command, ...timeout };

  return { command: leadingCd.command, cwd: leadingCd.directory, ...timeout };
}
