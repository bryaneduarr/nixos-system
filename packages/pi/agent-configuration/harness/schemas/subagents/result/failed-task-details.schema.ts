import { Type } from "typebox";

export const FailedTaskDetailsSchema = Type.Object({
  /** Terminal status of a task that did not succeed. */
  status: Type.Union([Type.Literal("error"), Type.Literal("cancelled")]),
});
