import { Value } from "typebox/value";
import { CodemodeArgumentsSchema } from "../../../../schemas/tool-rendering/codemode/script/codemode-arguments.schema.ts";

export function readScriptCode(args: unknown): string {
  return Value.Check(CodemodeArgumentsSchema, args) ? args.code : "";
}
