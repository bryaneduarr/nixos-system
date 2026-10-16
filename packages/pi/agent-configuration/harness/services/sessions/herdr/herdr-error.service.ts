import { readObjectValue } from "./read-object-value.service.ts";

const DEFAULT_HERDR_ERROR_MESSAGE = "Herdr command failed";

export function herdrError(value: unknown): Error {
  const error = readObjectValue(value);
  const message = typeof error.message === "string" ? error.message : DEFAULT_HERDR_ERROR_MESSAGE;
  return Object.assign(new Error(message), { code: error.code });
}
