import { join } from "node:path";
import { readPackagePath } from "../source-edit/read-package-path.service.ts";
import { replaceOnce } from "../source-edit/replace-once.service.ts";

const CONTEXT_SEGMENT_GUARD = [
  '  id: "context_pct",',
  "  render(ctx) {",
  '    if (ctx.customCompactionEnabled) return { content: "", visible: false };',
].join("\n");

const CONTEXT_SEGMENT_GUARD_HIDING_EMPTY_SESSION = [
  '  id: "context_pct",',
  "  render(ctx) {",
  "    const { input, output, cacheRead, cacheWrite } = ctx.usageStats;",
  "    const hasNoAssistantUsage = input + output + cacheRead + cacheWrite === 0;",
  '    if (ctx.customCompactionEnabled || hasNoAssistantUsage) return { content: "", visible: false };',
].join("\n");

replaceOnce(join(readPackagePath(), "segments.ts"), CONTEXT_SEGMENT_GUARD, CONTEXT_SEGMENT_GUARD_HIDING_EMPTY_SESSION);
