import type { z } from "zod";
import type { opencodeUsageResponseSchema } from "../../../schemas/providers/opencode/opencode-usage-response.schema.ts";

/** Usage body returned by the OpenCode Go usage endpoint, with the limit windows the provider reported. */
export type OpenCodeUsageResponse = Readonly<z.output<typeof opencodeUsageResponseSchema>>;
