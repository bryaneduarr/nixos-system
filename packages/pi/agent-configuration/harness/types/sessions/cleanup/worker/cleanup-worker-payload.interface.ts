import type { Static } from "typebox";
import type { CleanupWorkerPayloadSchema } from "../../../../schemas/sessions/cleanup/worker/cleanup-worker-payload.schema.ts";

/** Row that the cleanup worker receives as its JSON payload, from a session or an explicit exit. */
export type CleanupWorkerPayload = Static<typeof CleanupWorkerPayloadSchema>;
