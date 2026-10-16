import { Type } from "typebox";

export const RgEventSchema = Type.Object({
  type: Type.String(),
  data: Type.Object({
    path: Type.Object({ text: Type.String() }),
    line_number: Type.Number(),
    lines: Type.Optional(Type.Object({ text: Type.Optional(Type.String()) })),
  }),
});
