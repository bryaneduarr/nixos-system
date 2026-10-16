import { Type } from "typebox";

export const SubToolActivityRecordSchema = Type.Object({
  id: Type.String(),
  toolName: Type.String(),
  args: Type.Record(Type.String(), Type.Unknown()),
  status: Type.Union([Type.Literal("running"), Type.Literal("success"), Type.Literal("error")]),
  text: Type.String(),
  startedAt: Type.Number(),
  endedAt: Type.Optional(Type.Number()),
});
