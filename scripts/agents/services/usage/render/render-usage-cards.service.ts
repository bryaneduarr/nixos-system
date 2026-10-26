import { CARD_CHROME_WIDTH, MIN_CARD_WIDTH } from "../../../constants/render/card-layout.constant.ts";
import type { RenderUsageCardsInput } from "../../../types/render/render-usage-cards.interface.ts";
import type { CardContent, CardRenderOptions } from "../../../types/render/usage-card.interface.ts";
import type { ProviderUsage } from "../../../types/usage/provider-usage.interface.ts";
import { buildMessageCardContent } from "./build-message-card-content.service.ts";
import { buildOkCardContent } from "./build-ok-card-content.service.ts";
import { drawCardBox } from "./draw-card-box.service.ts";

function buildCardContent(usage: ProviderUsage, options: CardRenderOptions): CardContent {
  switch (usage.status) {
    case "ok":
      return buildOkCardContent(usage, options);
    case "not-signed-in":
    case "login-expired":
    case "error":
      return buildMessageCardContent(usage, options);
    default: {
      const unhandledUsage: never = usage;
      return unhandledUsage;
    }
  }
}

export function renderUsageCards(input: RenderUsageCardsInput): string {
  const options: CardRenderOptions = {
    colorEnabled: input.colorEnabled,
    innerWidth: Math.max(MIN_CARD_WIDTH, input.width) - CARD_CHROME_WIDTH,
    now: input.now,
  };
  const cards = input.usages.map((usage) => drawCardBox({ content: buildCardContent(usage, options), options }));
  return cards.map((cardLines) => cardLines.join("\n")).join("\n\n");
}
