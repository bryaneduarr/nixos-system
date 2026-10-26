import {
  DECIMAL_KILO_TOKENS_LIMIT,
  TOKENS_PER_MILLION,
  TOKENS_PER_THOUSAND,
} from "../../../constants/inspector/format/format.constant.ts";

export function formatTokens(tokens: number): string {
  if (tokens < TOKENS_PER_THOUSAND) return `${tokens}`;
  if (tokens < TOKENS_PER_MILLION) {
    return `${(tokens / TOKENS_PER_THOUSAND).toFixed(tokens < DECIMAL_KILO_TOKENS_LIMIT ? 1 : 0)}k`;
  }
  return `${(tokens / TOKENS_PER_MILLION).toFixed(1)}m`;
}
