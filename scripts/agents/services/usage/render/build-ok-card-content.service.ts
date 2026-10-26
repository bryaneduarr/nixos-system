import { NO_LIMITS_REPORTED_TEXT, TITLE_PLAN_SEPARATOR } from "../../../constants/render/card-text.constant.ts";
import { PROVIDER_DISPLAY_NAMES } from "../../../constants/usage/provider-order.constant.ts";
import type { CardContent, CardRenderOptions, OkProviderUsage } from "../../../types/render/usage-card.interface.ts";
import { buildWindowRows } from "./build-window-rows.service.ts";
import { sanitizeCardText } from "./sanitize-card-text.service.ts";

function describeTitle(usage: OkProviderUsage): string {
  const displayName = PROVIDER_DISPLAY_NAMES[usage.provider];
  if (usage.plan.state !== "reported") return displayName;
  const planName = sanitizeCardText(usage.plan.name);
  return planName === "" ? displayName : `${displayName}${TITLE_PLAN_SEPARATOR}${planName}`;
}

export function buildOkCardContent(usage: OkProviderUsage, options: CardRenderOptions): CardContent {
  const hasWindows = usage.windows.length > 0;
  return {
    provider: usage.provider,
    title: describeTitle(usage),
    bodyLines: hasWindows ? buildWindowRows(usage.windows, options) : [NO_LIMITS_REPORTED_TEXT],
  };
}
