import { StringEnum } from "@earendil-works/pi-ai";
import { Type } from "typebox";
import { DEFAULT_SEARCH_KIND, SEARCH_KINDS } from "../../../constants/tools/search/search-kinds.constant.ts";
import { DEFAULT_SEARCH_LIMIT } from "../../../constants/tools/search/search-limits.constant.ts";

export const SearchParamsSchema = Type.Object({
  /** Text, filename, symbol, pattern, or commit text to find. */
  query: Type.String({
    description: "Text, filename, symbol, structural pattern, or commit text to find.",
  }),
  /** Search strategy. */
  kind: Type.Optional(
    StringEnum(SEARCH_KINDS, {
      description: `Search strategy. Defaults to ${DEFAULT_SEARCH_KIND}, which combines text and filename search. file uses fuzzy fff ranking, symbol asks the language server and tree-sitter for definitions, references lists callers.`,
    }),
  ),
  /** Directory or file the search is limited to. */
  path: Type.Optional(Type.String({ description: "Optional directory or file to scope the search." })),
  /** Maximum results per section. */
  limit: Type.Optional(
    Type.Integer({
      minimum: 1,
      maximum: 100,
      description: `Maximum results per section. Defaults to ${DEFAULT_SEARCH_LIMIT}.`,
    }),
  ),
});
