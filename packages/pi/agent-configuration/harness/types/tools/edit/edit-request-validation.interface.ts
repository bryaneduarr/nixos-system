import type { InvalidEditRequest } from "./invalid-edit-request.interface.ts";
import type { ValidEditRequest } from "./valid-edit-request.interface.ts";

/** Result of converting edit parameters into a request. */
export type EditRequestValidation = ValidEditRequest | InvalidEditRequest;
