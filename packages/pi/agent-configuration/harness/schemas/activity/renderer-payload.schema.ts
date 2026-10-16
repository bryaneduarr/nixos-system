import { Type } from "typebox";

export const RendererPayloadSchema = Type.Object({
  content: Type.Optional(
    Type.Array(
      Type.Object({
        type: Type.String(),
        text: Type.Optional(Type.String()),
      }),
    ),
  ),
  details: Type.Optional(Type.Unknown()),
});
