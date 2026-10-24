import type { EditRequest } from "./edit-request.interface.ts";

/** An edit request that can run. */
export interface ValidEditRequest {
  /** Marks a usable request. */
  readonly valid: true;
  /** The converted request. */
  readonly request: EditRequest;
}
