import { readObjectValue } from "../response/read-object-value.service.ts";

const DEFAULT_HERDR_ERROR_MESSAGE = "Herdr command failed";

export function herdrError(candidate: unknown): Error {
  const error = readObjectValue(candidate);
  const message = typeof error.message === "string" ? error.message : DEFAULT_HERDR_ERROR_MESSAGE;
  return Object.assign(new Error(message), { code: error.code });
}
