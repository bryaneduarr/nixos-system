import { Type } from "typebox";

export const ReadParamsSchema = Type.Object({
  /** File to read. */
  path: Type.String({ description: "File to read." }),
  /** First line to read, one-based. */
  offset: Type.Optional(Type.Integer({ minimum: 1, description: "First line to read (1-based)." })),
  /** Maximum number of lines to return. */
  limit: Type.Optional(Type.Integer({ minimum: 1, description: "Maximum number of lines to return." })),
  /** Name of the symbol whose body is returned. */
  symbol: Type.Optional(Type.String({ description: "Return the body of a named symbol." })),
});
