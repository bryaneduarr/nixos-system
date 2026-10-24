import type { Static } from "typebox";
import type { TextContentSchema } from "../../../schemas/tools/result/text-content.schema.ts";

/** Text block of a tool result. */
export type TextContent = Static<typeof TextContentSchema>;
