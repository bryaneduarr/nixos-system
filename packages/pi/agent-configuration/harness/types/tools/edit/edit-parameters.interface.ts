import type { Static } from "typebox";
import type { EditParamsSchema } from "../../../schemas/tools/edit/edit-parameters.schema.ts";

/** Input of the edit tool as sent by the model; optional fields get defaults at the boundary. */
export type EditParameters = Static<typeof EditParamsSchema>;
