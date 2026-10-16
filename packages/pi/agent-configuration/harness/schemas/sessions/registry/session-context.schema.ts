import { Type } from "typebox";

export const SessionContextSchema = Type.Union([
  Type.Object({
    /** Marks that the context window and token count were measured. */
    usageState: Type.Literal("measured"),
    /** Tokens currently counted in the context window. */
    tokens: Type.Number({ minimum: 0 }),
    /** Share of the context window in use, in percent. */
    percent: Type.Number({ minimum: 0 }),
    /** Size of the context window in tokens. */
    contextWindow: Type.Number({ exclusiveMinimum: 0 }),
  }),
  Type.Object({
    /** Marks that the context window is known but its token count is not. */
    usageState: Type.Literal("tokens-unknown"),
    /** Size of the context window in tokens. */
    contextWindow: Type.Number({ exclusiveMinimum: 0 }),
  }),
  Type.Object({
    /** Marks that the session reported no context usage. */
    usageState: Type.Literal("unavailable"),
  }),
]);
