import { Type } from "typebox";

export const SubToolActivityRecordSchema = Type.Object({
  /** Identifier of the nested tool call. */
  id: Type.String(),
  /** Name of the tool that ran. */
  toolName: Type.String(),
  /** Arguments the tool was called with. */
  args: Type.Record(Type.String(), Type.Unknown()),
  /** Lifecycle state of the nested tool call. */
  status: Type.Union([Type.Literal("running"), Type.Literal("success"), Type.Literal("error")]),
  /** Bounded result text of the nested tool call. */
  text: Type.String(),
  /** Start time of the nested tool call, in milliseconds since the epoch. */
  startedAt: Type.Number(),
  /** End time of the nested tool call, absent while it runs. */
  endedAt: Type.Optional(Type.Number()),
});
