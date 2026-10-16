import { Type } from "typebox";

/** Text block of a tool result; other block kinds are ignored by renderers. */
export const TextContentSchema = Type.Object({
  /** Block kind, always "text" for this schema. */
  type: Type.Literal("text"),
  /** Text of the block. */
  text: Type.String(),
});
