import { Type } from "typebox";
import { EditParamsSchema } from "./edit-parameters.schema.ts";

export const RawEditArgumentsSchema = Type.Object({
  ...EditParamsSchema.properties,
  /** Operation as the model sent it, which some models garble with tool-call markup. */
  op: Type.Optional(Type.String()),
});
