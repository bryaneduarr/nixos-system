import { Type } from "typebox";

export const RendererPayloadSchema = Type.Object({
  /** Content blocks of the payload, absent when the tool returned no content. */
  content: Type.Optional(
    Type.Array(
      Type.Object({
        /** Kind of the content block, such as text. */
        type: Type.String(),
        /** Text of a text block. */
        text: Type.Optional(Type.String()),
      }),
    ),
  ),
  /** Raw details the tool attached to the payload, validated by the consumers that read them. */
  details: Type.Optional(Type.Unknown()),
});
