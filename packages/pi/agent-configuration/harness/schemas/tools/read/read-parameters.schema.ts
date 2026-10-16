import { Type } from "typebox";

export const ReadParamsSchema = Type.Object({
  path: Type.String({ description: "File to read." }),
  offset: Type.Optional(Type.Integer({ minimum: 1, description: "First line to read (1-based)." })),
  limit: Type.Optional(Type.Integer({ minimum: 1, description: "Maximum number of lines to return." })),
  symbol: Type.Optional(Type.String({ description: "Return the body of a named symbol." })),
});
