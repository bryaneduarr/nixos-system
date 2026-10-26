import { OPENCODE_USAGE_URL } from "../../../constants/providers/opencode/opencode-provider.constant.ts";
import type { ProviderEnvironment } from "../../../types/providers/provider-environment.interface.ts";
import { CLAUDE_TEST_NOW, claudeUsageBody } from "../../providers/claude/fetch-claude-usage.test-double.ts";
import { opencodeUsageBody } from "../../providers/opencode/fetch-opencode-usage.test-double.ts";

export function usageBodyForUrl(url: string): typeof claudeUsageBody | typeof opencodeUsageBody {
  return url === OPENCODE_USAGE_URL ? opencodeUsageBody : claudeUsageBody;
}

export function createRecordingEnvironment(homeDirectory: string) {
  const fetchedUrls: string[] = [];
  const environment: ProviderEnvironment = {
    homeDirectory,
    now: CLAUDE_TEST_NOW,
    fetchUrl: async (url) => {
      fetchedUrls.push(url);
      return { status: 200, json: async () => usageBodyForUrl(url) };
    },
  };
  return { environment, fetchedUrls };
}
