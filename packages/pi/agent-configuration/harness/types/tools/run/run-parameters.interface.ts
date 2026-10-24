import type { Static } from "typebox";
import type { RunParamsSchema } from "../../../schemas/tools/run/run-parameters.schema.ts";

/** Input of the run tool after argument repair; optional fields get defaults at the boundary. */
export type RunParameters = Static<typeof RunParamsSchema>;
