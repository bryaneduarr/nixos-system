import { z } from "zod";

/** Width of a terminal in columns; a stream that is not a terminal reports no width. */
export const terminalColumnsSchema = z.number().int().positive();
