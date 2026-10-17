import type { Static } from "typebox";
import type { ReadParamsSchema } from "../../../schemas/tools/read/read-parameters.schema.ts";

/** Input of the read tool as sent by the model; optional fields get defaults at the boundary. */
export type ReadParameters = Static<typeof ReadParamsSchema>;
