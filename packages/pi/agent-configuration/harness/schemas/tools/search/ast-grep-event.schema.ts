import { Type } from "typebox";

export const AstGrepEventSchema = Type.Object({
  /** Path of the matching file. */
  file: Type.String(),
  /** Source text of the match, when ast-grep reports it. */
  lines: Type.Optional(Type.String()),
  /** Position of the match. */
  range: Type.Object({
    /** Start position of the match. */
    start: Type.Object({
      /** Zero-based line of the match. */
      line: Type.Number(),
    }),
  }),
});
