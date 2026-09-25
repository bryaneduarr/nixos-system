import { StringEnum } from "@earendil-works/pi-ai";
import { Type } from "typebox";

export const SearchParams = Type.Object({
  query: Type.String({
    description: "Text, filename, symbol, structural pattern, or commit text to find.",
  }),
  kind: Type.Optional(
    StringEnum(["auto", "text", "file", "symbol", "structural", "history"] as const, {
      description: "Search strategy. Defaults to auto, which combines text and filename search.",
    }),
  ),
  path: Type.Optional(Type.String({ description: "Optional directory or file to scope the search." })),
  limit: Type.Optional(Type.Integer({
    minimum: 1,
    maximum: 100,
    description: "Maximum results per section. Defaults to 20.",
  })),
});

export const ReadParams = Type.Object({
  path: Type.String({ description: "File to read." }),
  offset: Type.Optional(Type.Integer({ minimum: 1, description: "First line to read (1-based)." })),
  limit: Type.Optional(Type.Integer({ minimum: 1, description: "Maximum number of lines to return." })),
  symbol: Type.Optional(Type.String({ description: "Return the body of a named symbol." })),
});

export const EditParams = Type.Object({
  op: StringEnum(["replace", "create", "delete", "move"] as const, {
    description: "replace edits an existing file, create writes a new file, delete removes a file, move renames or relocates a file.",
  }),
  path: Type.Optional(Type.String({ description: "Target file. Required for replace, create, delete, move." })),
  oldText: Type.Optional(Type.String({ description: "Exact text to replace for op=replace." })),
  newText: Type.Optional(Type.String({ description: "Replacement text for op=replace." })),
  edits: Type.Optional(Type.Array(Type.Object({
    oldText: Type.String(),
    newText: Type.String(),
  }), { description: "Batch of exact replacements applied in order for op=replace." })),
  replaceAll: Type.Optional(Type.Boolean({
    description: "Allow replacing every occurrence of oldText. Defaults to false.",
  })),
  content: Type.Optional(Type.String({ description: "File contents for op=create." })),
  overwrite: Type.Optional(Type.Boolean({ description: "Allow overwriting an existing file." })),
  from: Type.Optional(Type.String({ description: "Source path for op=move (alias of path)." })),
  to: Type.Optional(Type.String({ description: "Destination path for op=move." })),
});

export const RunParams = Type.Object({
  command: Type.String({ description: "Shell command to execute." }),
  timeoutMs: Type.Optional(Type.Integer({
    minimum: 1,
    description: "Timeout in milliseconds. Defaults to 120000.",
  })),
});
