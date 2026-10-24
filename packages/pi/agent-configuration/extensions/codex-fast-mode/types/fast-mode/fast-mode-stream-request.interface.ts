import type { Api, Model, TranscriptContext } from "@earendil-works/pi-ai";
import type { streamSimple } from "@earendil-works/pi-ai/api/openai-codex-responses";

/** What one fast-mode provider stream needs from Pi. */
export interface FastModeStreamRequest {
  /** Model Pi selected for the request. */
  readonly model: Model<Api>;
  /** Transcript and tools sent to the model. */
  readonly context: TranscriptContext;
  /** Stream options Pi passes; mirrors Pi's optional argument, so it is undefined when Pi passes none. */
  readonly options: Parameters<typeof streamSimple>[2];
  /** Whether the request goes out with the priority service tier. */
  readonly isFastModeActive: boolean;
}
