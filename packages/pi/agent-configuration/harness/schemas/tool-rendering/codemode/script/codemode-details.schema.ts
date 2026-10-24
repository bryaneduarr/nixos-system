import { Type } from "typebox";

/** Details that Pi's codemode tool attaches to a result: the nested tool calls of the script. */
export const CodemodeDetailsSchema = Type.Object({
  /** Tool calls the script made, in call order. */
  calls: Type.Array(
    Type.Object({
      /** Registered name of the called tool. */
      name: Type.String(),
      /** Compact JSON of the call arguments, truncated by Pi. */
      args: Type.String(),
      /** Progress of the call. */
      status: Type.Union([
        Type.Literal("running"),
        Type.Literal("ok"),
        Type.Literal("error"),
        Type.Literal("cancelled"),
      ]),
      /** Duration in milliseconds once the call has finished. */
      durationMs: Type.Optional(Type.Number()),
      /** Error text of a failed call. */
      error: Type.Optional(Type.String()),
    }),
  ),
});
