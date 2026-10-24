import {
  EDIT_TOOL_NAME,
  READ_TOOL_NAME,
  RUN_TOOL_NAME,
  SEARCH_TOOL_NAME,
} from "../../../constants/tools/active-tools/harness-tools.constant.ts";
import type { HarnessTool } from "../../../types/tools/active-tools/harness-tool.interface.ts";
import { editDetail } from "./edit-detail.service.ts";
import { readDetail } from "./read-detail.service.ts";
import { runDetail } from "./run-detail.service.ts";
import { searchDetail } from "./search-detail.service.ts";

export function successDetail(tool: HarnessTool, text: string): string[] {
  switch (tool) {
    case SEARCH_TOOL_NAME:
      return [searchDetail(text)];
    case READ_TOOL_NAME:
      return [readDetail(text)];
    case EDIT_TOOL_NAME:
      return [editDetail(text)];
    case RUN_TOOL_NAME:
      return [runDetail(text)];
    default:
      return tool satisfies never;
  }
}
