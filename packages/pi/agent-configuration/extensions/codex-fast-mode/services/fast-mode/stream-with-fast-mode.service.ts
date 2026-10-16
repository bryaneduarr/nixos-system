import {
  type Api,
  clampThinkingLevel,
  type Model,
  type SimpleStreamOptions,
  type TranscriptContext,
} from "@earendil-works/pi-ai";
import { stream, streamSimple } from "@earendil-works/pi-ai/api/openai-codex-responses";
import { buildBaseOptions } from "@earendil-works/pi-ai/api/simple-options";
import { CODEX_RESPONSES_API, PRIORITY_SERVICE_TIER } from "../../constants/codex/codex.constant.ts";

function isCodexResponsesModel(model: Model<Api>): model is Model<"openai-codex-responses"> {
  return model.api === CODEX_RESPONSES_API;
}

export function streamWithFastMode(
  model: Model<Api>,
  context: TranscriptContext,
  options: SimpleStreamOptions | undefined,
  isFastModeActive: boolean,
) {
  if (!isCodexResponsesModel(model)) throw new Error(`Expected Codex Responses API, received ${model.api}`);

  if (!isFastModeActive) return streamSimple(model, context, options);
  if (!options?.apiKey) throw new Error(`No API key for provider: ${model.provider}`);

  const baseOptions = buildBaseOptions(model, context, options, options.apiKey);
  const thinkingLevel = options.reasoning ? clampThinkingLevel(model, options.reasoning) : undefined;
  const reasoningOptions =
    thinkingLevel === undefined || thinkingLevel === "off" ? {} : { reasoningEffort: thinkingLevel };
  const toolChoiceOptions = options.toolChoice === undefined ? {} : { toolChoice: options.toolChoice };

  return stream(model, context, {
    ...baseOptions,
    ...toolChoiceOptions,
    ...reasoningOptions,
    serviceTier: PRIORITY_SERVICE_TIER,
  });
}
