import { Type } from "typebox";

export const AstGrepEventSchema = Type.Object({
  file: Type.String(),
  lines: Type.Optional(Type.String()),
  range: Type.Object({ start: Type.Object({ line: Type.Number() }) }),
});
