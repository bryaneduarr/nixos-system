import { mock } from "bun:test";

export interface RecordedRequest {
  readonly fast: boolean;
  readonly options: Record<string, unknown>;
}

const requests: RecordedRequest[] = [];

mock.module("@earendil-works/pi-ai/api/openai-codex-responses", () => ({
  stream: (_model: unknown, _context: unknown, options: Record<string, unknown>) =>
    requests.push({ fast: true, options }),
  streamSimple: (_model: unknown, _context: unknown, options: Record<string, unknown>) =>
    requests.push({ fast: false, options }),
}));

export function lastRequest(): RecordedRequest {
  const request = requests.at(-1);
  if (request === undefined) throw new Error("No request was recorded");
  return request;
}
