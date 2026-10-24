import { type Api, clampThinkingLevel, type Model } from "@earendil-works/pi-ai";
import { stream, streamSimple } from "@earendil-works/pi-ai/api/openai-codex-responses";
import { buildBaseOptions } from "@earendil-works/pi-ai/api/simple-options";
import { CODEX_RESPONSES_API, PRIORITY_SERVICE_TIER } from "../../constants/codex/codex.constant.ts";
import type { FastModeStreamRequest } from "../../types/fast-mode/fast-mode-stream-request.interface.ts";

function isCodexResponsesModel(model: Model<Api>): model is Model<"openai-codex-responses"> {
  return model.api === CODEX_RESPONSES_API;
}

function missingApiKeyError(provider: string): Error {
  return new Error(`No API key for provider: ${provider}`);
}

export function streamWithFastMode({ model, context, options, isFastModeActive }: FastModeStreamRequest) {
  if (!isCodexResponsesModel(model)) throw new Error(`Expected Codex Responses API, received ${model.api}`);

  if (!isFastModeActive) return streamSimple(model, context, options);
  if (options === undefined) throw missingApiKeyError(model.provider);
  const apiKey = options.apiKey;
  if (!apiKey) throw missingApiKeyError(model.provider);

  const baseOptions = buildBaseOptions(model, context, options, apiKey);
  const reasoningLevel = options.reasoning ? clampThinkingLevel(model, options.reasoning) : "off";
  const reasoningOptions = reasoningLevel === "off" ? {} : { reasoningEffort: reasoningLevel };
  const toolChoiceOptions = options.toolChoice === undefined ? {} : { toolChoice: options.toolChoice };

  return stream(model, context, {
    ...baseOptions,
    ...toolChoiceOptions,
    ...reasoningOptions,
    serviceTier: PRIORITY_SERVICE_TIER,
  });
}
