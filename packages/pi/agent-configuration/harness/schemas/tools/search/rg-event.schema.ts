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
    /** Matching line, as UTF-8 text or as base64 bytes when it is not valid UTF-8. */
    lines: Type.Union([
      Type.Object({
        /** Matching line text. */
        text: Type.String(),
      }),
      Type.Object({
        /** Matching line as base64 bytes. */
        bytes: Type.String(),
      }),
    ]),
  }),
});
