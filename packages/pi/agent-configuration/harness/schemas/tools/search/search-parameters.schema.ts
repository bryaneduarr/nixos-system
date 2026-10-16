import { StringEnum } from "@earendil-works/pi-ai";
import { Type } from "typebox";

export const SearchParamsSchema = Type.Object({
  query: Type.String({
    description: "Text, filename, symbol, structural pattern, or commit text to find.",
  }),
  kind: Type.Optional(
    StringEnum(["auto", "text", "file", "symbol", "structural", "history"] as const, {
      description: "Search strategy. Defaults to auto, which combines text and filename search.",
    }),
  ),
  path: Type.Optional(Type.String({ description: "Optional directory or file to scope the search." })),
  limit: Type.Optional(
    Type.Integer({
      minimum: 1,
      maximum: 100,
      description: "Maximum results per section. Defaults to 20.",
    }),
  ),
});
