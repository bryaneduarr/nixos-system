import type { Static } from "typebox";
import type { SearchParamsSchema } from "../../../schemas/tools/search/search-parameters.schema.ts";

/** Input of the search tool as sent by the model; optional fields get defaults at the boundary. */
export type SearchParameters = Static<typeof SearchParamsSchema>;
