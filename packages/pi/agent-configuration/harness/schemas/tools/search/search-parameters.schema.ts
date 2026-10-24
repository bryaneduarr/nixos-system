import { StringEnum } from "@earendil-works/pi-ai";
import { Type } from "typebox";

export const SearchParamsSchema = Type.Object({
  /** Text, filename, symbol, pattern, or commit text to find. */
  query: Type.String({
    description: "Text, filename, symbol, structural pattern, or commit text to find.",
  }),
  /** Search strategy. */
  kind: Type.Optional(
    StringEnum(["auto", "text", "file", "symbol", "references", "structural", "history"] as const, {
      description:
        "Search strategy. Defaults to auto, which combines text and filename search. file uses fuzzy fff ranking, symbol asks the language server and tree-sitter for definitions, references lists callers.",
    }),
  ),
  /** Directory or file the search is limited to. */
  path: Type.Optional(Type.String({ description: "Optional directory or file to scope the search." })),
  /** Maximum results per section. */
  limit: Type.Optional(
    Type.Integer({
      minimum: 1,
      maximum: 100,
      description: "Maximum results per section. Defaults to 20.",
    }),
  ),
});
