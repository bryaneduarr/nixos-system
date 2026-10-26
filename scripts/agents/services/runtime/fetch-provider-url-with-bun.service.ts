import { PROVIDER_REQUEST_TIMEOUT_MILLISECONDS } from "../../constants/providers/provider-http.constant.ts";
import type {
  ProviderHttpRequestOptions,
  ProviderHttpResponse,
} from "../../types/providers/provider-environment.interface.ts";

export async function fetchProviderUrlWithBun(
  url: string,
  options: ProviderHttpRequestOptions,
): Promise<ProviderHttpResponse> {
  const response = await fetch(url, {
    method: "GET",
    headers: options.headers,
    signal: AbortSignal.timeout(PROVIDER_REQUEST_TIMEOUT_MILLISECONDS),
  });
  return { status: response.status, json: () => response.json() };
}
