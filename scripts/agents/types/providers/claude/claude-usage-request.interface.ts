import type { ClaudeUsageResponse } from "./claude-usage-response.interface.ts";

/** Outcome of one request to the Claude usage endpoint, discriminated by what the response allowed. */
export type ClaudeUsageRequest =
  | {
      /** The endpoint answered with a usage body that matches the expected format. */
      readonly state: "received";
      /** Parsed usage body. */
      readonly response: ClaudeUsageResponse;
    }
  | {
      /** The endpoint rejected the access token with HTTP 401 or 403. */
      readonly state: "rejected-token";
    }
  | {
      /** The endpoint answered with a status other than 2xx, 401, or 403. */
      readonly state: "http-error";
      /** HTTP status code the endpoint answered with. */
      readonly status: number;
    }
  | {
      /** The request did not complete because the network failed. */
      readonly state: "network-error";
    }
  | {
      /** The endpoint answered with a body that does not match the expected format. */
      readonly state: "malformed-body";
    };
