import { Type } from "typebox";

export const RgEventSchema = Type.Object({
  /** Kind of ripgrep JSON event, such as match. */
  type: Type.String(),
  /** Payload of the event. */
  data: Type.Object({
    /** File that contains the match. */
    path: Type.Object({
      /** Path text as ripgrep printed it. */
      text: Type.String(),
    }),
    /** One-based line number of the match. */
    line_number: Type.Number(),
    /** Text of the matching line. */
    lines: Type.Optional(
      Type.Object({
        /** Matching line text, when printed as UTF-8. */
        text: Type.Optional(Type.String()),
      }),
    ),
  }),
});
