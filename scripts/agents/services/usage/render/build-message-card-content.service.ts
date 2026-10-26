import { MESSAGE_STATUS_SGR } from "../../../constants/render/card-color.constant.ts";
import { MESSAGE_STATUS_WORDS } from "../../../constants/render/card-text.constant.ts";
import { PROVIDER_DISPLAY_NAMES } from "../../../constants/usage/provider-order.constant.ts";
import type {
  CardContent,
  CardRenderOptions,
  MessageProviderUsage,
} from "../../../types/render/usage-card.interface.ts";
import { paintText } from "./paint-text.service.ts";
import { sanitizeCardText } from "./sanitize-card-text.service.ts";
import { wrapPlainText } from "./wrap-plain-text.service.ts";

export function buildMessageCardContent(usage: MessageProviderUsage, options: CardRenderOptions): CardContent {
  const statusLine = paintText({
    text: MESSAGE_STATUS_WORDS[usage.status],
    sgr: MESSAGE_STATUS_SGR[usage.status],
    colorEnabled: options.colorEnabled,
  });
  return {
    provider: usage.provider,
    title: PROVIDER_DISPLAY_NAMES[usage.provider],
    bodyLines: [statusLine, ...wrapPlainText(sanitizeCardText(usage.message), options.innerWidth)],
  };
}
