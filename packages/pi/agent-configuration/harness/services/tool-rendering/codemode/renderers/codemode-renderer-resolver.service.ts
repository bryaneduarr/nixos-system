import type { ToolRendererResolver } from "@earendil-works/pi-coding-agent";
import { CODEMODE_TOOL_NAME } from "../../../../constants/tools/active-tools/codemode.constant.ts";
import { createCodemodeRenderers } from "./create-codemode-renderers.service.ts";

export const codemodeRendererResolver: ToolRendererResolver = (toolName, next) =>
  toolName === CODEMODE_TOOL_NAME ? createCodemodeRenderers() : next();
