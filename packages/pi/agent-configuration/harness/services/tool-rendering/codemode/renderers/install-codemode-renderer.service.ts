import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { codemodeRendererResolver } from "./codemode-renderer-resolver.service.ts";

export function installCodemodeRenderer(pi: ExtensionAPI): void {
  pi.registerToolRenderer(codemodeRendererResolver);
}
