import { TOOL_TITLES } from "../../../constants/tool-rendering/labels/tool-title.constant.ts";
import type { HarnessPresentation } from "../../../types/tool-rendering/presentation/harness-presentation.interface.ts";
import type { ResultPresentationInput } from "../../../types/tool-rendering/presentation/result-presentation-input.interface.ts";
import { errorDetail } from "../details/error-detail.service.ts";
import { successDetail } from "../details/success-detail.service.ts";
import { harnessToolTarget } from "../labels/harness-tool-target.service.ts";

export function resultPresentation({ tool, args, text, state }: ResultPresentationInput): HarnessPresentation {
  const base = { title: TOOL_TITLES[tool], target: harnessToolTarget(tool, args) };
  if (state === "running") return { ...base, state, details: [] };
  if (state === "error") return { ...base, state, details: errorDetail(tool, text) };
  return { ...base, state, details: successDetail(tool, text) };
}
